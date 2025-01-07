#!/usr/bin/env bash

if [ -z "$1" ]; then
  echo "Usage: $0 <input_file> [output_name]"
  exit 1
fi

FILE="$1"

# Hls time is 5 seconds by default
if [ -z "$HLS_TIME" ]; then
  HLS_TIME=5
fi

ADDITIONAL_PARAMS=""
if [ "$USE_HARDWARE_ACCELERATION" = true ]; then
  # H264_ENCODER is set to "x264" if hardware acceleration is not enabled

  HWACCELS="$(ffmpeg -hide_banner -hwaccels)"

  # Look if hawaccels contains videotoolbox
  if echo "$HWACCELS" | grep -q videotoolbox; then
    # ffmpeg does not automatically use videotoolbox if available
    H264_ENCODER="h264_videotoolbox"
    echo "Hardware Support: videotoolbox (apple silicon)"
  else
    ADDITIONAL_PARAMS="$ADDITIONAL_PARAMS -hwaccel auto"
    H264_ENCODER="h264"
    echo "Hardware Support: if available"
  fi
elif [ "$USE_HARDWARE_ACCELERATION" = false ]; then
  H264_ENCODER="libx264"
  echo "Hardware Support: disabled"
else
  echo "You can enable hardware acceleration by setting USE_HARDWARE_ACCELERATION=true"
  H264_ENCODER="h264"
  #H264_ENCODER="libsvtav1"
fi

AV1_ENCODER="libsvtav1"

# Video Qualities:
#    - 4K 60fps (3840x2160)
#    - 1440p 60fps (2560x1440)
#    - 1080p 60/30fps (1920x1080)
#    - 720p 30fps (1280x720)
#    - 480p 30fps (854x480)
#    - 360p 30fps (640x360)
#    - 240p 30fps (426x240)
#    - audio only (multipple formats)
# fps valies are maximum values (if not available, it will use the closest value)
# qualities that are not available will be skipped



PROBE="$(ffprobe -v error -select_streams v:0 -show_entries stream=codec_name,width,height,display_aspect_ratio,avg_frame_rate -of csv=p=0 "$FILE")"
VIDEO_CODEC="$(echo "$PROBE" | cut -d ',' -f 1)"
VIDEO_WIDTH="$(echo "$PROBE" | cut -d ',' -f 2)"
VIDEO_HEIGHT="$(echo "$PROBE" | cut -d ',' -f 3)"
VIDEO_DAR="$(echo "$PROBE" | cut -d ',' -f 4)"
VIDEO_FPS_RAW="$(echo "$PROBE" | cut -d ',' -f 5)"

# Calcuate fps from FFprobe export using bc
VIDEO_FPS=$(echo "$VIDEO_FPS_RAW" | bc -l | cut -d. -f1)
# lets count 59 fps as well
echo "Video FPS: $VIDEO_FPS"
CAN_DO_60FPS=$([ "$VIDEO_FPS" -ge 59 ] && echo 1 || echo 0)
echo "Video: ${VIDEO_WIDTH}x${VIDEO_HEIGHT}(${VIDEO_DAR}) @ $(printf "%.2f\n" "$VIDEO_FPS") (${VIDEO_CODEC})"

if [ -z "$2" ]; then
  FILE_NAME=$(basename "$FILE" | cut -d. -f1)
else
  FILE_NAME="$2"
fi
echo "Output DIR: $FILE_NAME"


STREAM_NR=0
AUDIO_STREAM_NR=0
STREAM_MAPS=""
STREAM_PARAMS=""

# Audio Streams

function audio_stream_params() { # nr,codec,bitrate
  echo "-c:a:$1 $2 -b:a:$1 $3"
}
function audio_stream_maps() {
  #echo "-map 0:a:0"
  echo "-map 0:a:0"
}

function audio_stream() {
  echo "Add Audio Stream $1 $2 -> $AUDIO_STREAM_NR"
  STREAM_MAPS="$STREAM_MAPS $(audio_stream_maps)"
  STREAM_PARAMS="$STREAM_PARAMS $(audio_stream_params $AUDIO_STREAM_NR "$1" "$2")"
  AUDIO_STREAM_NR=$((AUDIO_STREAM_NR + 1))
}

# Video Streams
function video_codec_params() {
  case $2 in
  av1)
    echo "-crf:V:$1 30 -preset:v:$1 10 -c:v:$1 libsvtav1"
    ;;
  h264)
    echo "-crf:v:$1 22 -preset:v:$1 fast -c:v:$1 $H264_ENCODER"
    ;;
  *)
    echo ""
    ;;
  esac
}

function video_stream_params() { # nr,height,max_fps,max_bitrate
    echo "-filter:v:$1 scale=-2:$2,fps=fps='min($3,$VIDEO_FPS_RAW)' -maxrate:v:$1 $4 -bufsize:v:$1 1.5*$4"
}

function video_stream_maps() {
  #echo "-map 0:v:0" #-map 0:a:0
  echo "-map 0:v:0"
}

function video_stream() {
  STREAM_MAPS="$STREAM_MAPS $(video_stream_maps)"
  # shellcheck disable=SC2089
  STREAM_PARAMS="$STREAM_PARAMS $(video_codec_params $STREAM_NR "$1") $(video_stream_params $STREAM_NR "$2" "$3" "$4")"

  video_codec_params $STREAM_NR "$1"
  video_stream_params $STREAM_NR "$2" "$3" "$4"
  echo "Added Video Stream ${2}p ${3}fps ($1) -> $STREAM_NR"

  STREAM_NR=$((STREAM_NR + 1))
}


function adaptive_video_streams() {

  # If 240p is available (height >= 240)
  if [ "$VIDEO_HEIGHT" -ge 240 ]; then
    video_stream "$1" 240 30 "$2*250k"
  fi

  # If 360p is available (height >= 360)
  if [ "$VIDEO_HEIGHT" -ge 360 ]; then
    video_stream "$1" 360 30 "$2*500k"
  fi

  # If 480p is available (height >= 480)
  if [ "$VIDEO_HEIGHT" -ge 480 ]; then
      video_stream "$1" 480 30 "$2*1000k"
  fi

  # If 720p is available (height >= 720)
  if [ "$VIDEO_HEIGHT" -ge 720 ]; then
      video_stream "$1" 720 30 "$2*3000k"
  fi

  # If 1080p is available (height >= 1920 and fps >= 30)
    if [ "$VIDEO_HEIGHT" -ge 1080 ]; then
        video_stream "$1" 1080 30 "$2*6000k"
    fi

  # If 1080p60 is available (height >= 1920 and fps >= 60)
  if [ "$VIDEO_HEIGHT" -ge 1080 ] && [ "$CAN_DO_60FPS" -eq 1 ]; then
      video_stream "$1" 1080 60 "$2*12000k"
  fi

  # If 1440p is available (height >= 1440)
  if [ "$VIDEO_HEIGHT" -ge 2560 ]; then
      video_stream "$1" 1440 60 "$2*24000k"
  fi


  # If 4k is available (height >= 2160)
  if [ "$VIDEO_HEIGHT" -ge 3840 ]; then
      video_stream "$1" 2160 60 "$2*48000k"
  fi
}

adaptive_video_streams "av1" 0.5
adaptive_video_streams "h264" 1



audio_stream "aac" "64k"
audio_stream "libopus" "48k"
audio_stream "libopus" "96k"




FALLBACK_VIDEO_ADDITIONAL_PARAMS=""
VIDEO_ALREADY_H264=$(echo "$VIDEO_CODEC" | grep -q "h264"; echo $?)
if [ "$VIDEO_ALREADY_H264" -eq 0 ]; then
  FALLBACK_VIDEO_ADDITIONAL_PARAMS="-c:v copy"
else
  FALLBACK_VIDEO_ADDITIONAL_PARAMS="-movflags faststart -c:v $H264_ENCODER -crf 22 -preset fast"
fi



mkdir -p "$FILE_NAME"
mkdir -p "$FILE_NAME/dash"


echo ""
echo ""
echo "Start Encoding $FILE -> $FILE_NAME"
time ffmpeg -hide_banner $ADDITIONAL_PARAMS -y -i "$FILE" \
      -c:a aac -movflags faststart -rematrix_maxval 1.0 -ac 2 \
      $STREAM_MAPS $STREAM_PARAMS \
      -adaptation_sets "id=0,streams=v id=1,streams=a" \
      -mpd_profile "dash" \
      -init_seg_name "stream-\$RepresentationID\$-init.\$ext\$" \
      -media_seg_name "stream-\$RepresentationID\$-chunk\$Number%05d\$.\$ext\$" \
      -f dash "$FILE_NAME/dash/manifest.mpd" \
      $FALLBACK_VIDEO_ADDITIONAL_PARAMS -c:a aac "$FILE_NAME/video.mp4"\
      -vn "$FILE_NAME/audio.mp3" \
      -c:a libopus -b:a 64k -rematrix_maxval 1.0 -ac 2 -vn "$FILE_NAME/audio.ogg"

echo "Encoding Completed"
