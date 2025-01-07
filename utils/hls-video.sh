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
    H264_ENCODER="h264_videotoolbox"
    echo "Hardware Support: videotoolbox (apple silicon)"
  elif echo "$HWACCELS" | grep -q nvenc; then
    H264_ENCODER="h264_nvenc"
    echo "Hardware Support: nvenc (nvidia)"
  elif echo "$HWACCELS" | grep -q cuda; then
    H264_ENCODER="h264_nvenc"
    echo "Hardware Support: cuda (nvidia)"
  elif echo "$HWACCELS" | grep -q qsv; then
    H264_ENCODER="h264_qsv"
    echo "Hardware Support: quicksync (intel)"
  elif echo "$HWACCELS" | grep -q vaapi; then
    H264_ENCODER="h264_vaapi"
    ADDITIONAL_PARAMS="$ADDITIONAL_PARAMS -hwaccel vaapi -hwaccel_output_format vaapi"
    echo "Hardware Support: vaapi (intel, amd, others)"
  else
    H264_ENCODER="h264"
    echo "Hardware Support: none"
  fi
elif [ "$USE_HARDWARE_ACCELERATION" = false ]; then
  H264_ENCODER="libx264"
  echo "Hardware Support: disabled"
else
  echo "You can enable hardware acceleration by setting USE_HARDWARE_ACCELERATION=true"
  H264_ENCODER="h264"
fi

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
VIDEO_FPS=$(("$VIDEO_FPS_RAW"))
# lets count 59 fps as well
CAN_DO_60FPS=$([ "$VIDEO_FPS" -ge 59 ])

echo "Video: ${VIDEO_WIDTH}x${VIDEO_HEIGHT}(${VIDEO_DAR}) @ $(printf "%.2f\n" "$VIDEO_FPS") (${VIDEO_CODEC})"

if [ -z "$2" ]; then
  FILE_NAME=$(basename "$FILE" | cut -d. -f1)
else
  FILE_NAME="$2"
fi

# shellcheck disable=SC2112
function stream_params() { # nr,height,max_fps,max_bitrate
    # math min (fps, max_fps) $3 vs $VIDEO_FPS
    #TARGET_FPS=$(printf "%.0f\n" "$VIDEO_FPS")
    #TARGET_FPS=$(a_min "$3" "$TARGET_FPS")
    # make it an integer
    #

    echo "-filter:v:$1 scale=-2:$2,fps=fps='min($3,$VIDEO_FPS_RAW)' -c:v:$1 $H264_ENCODER -maxrate:v:$1 $4 -bufsize:v:$1 2*$4"
}
# shellcheck disable=SC2112
function stream_maps() {
  echo "-map 0:v:0 -map 0:a:0"
}

# shellcheck disable=SC2112
function var_stream_map() { #nr, name
    echo "v:$1,a:$1,name:$2"
}

STREAM_NR=0
STREAM_MAPS=""
STREAM_PARAMS=""
VAR_STREAM_MAPS=""

# If 240p is available (height >= 240)
if [ "$VIDEO_HEIGHT" -ge 240 ]; then
    STREAM_MAPS="$STREAM_MAPS $(stream_maps)"
    STREAM_PARAMS="$STREAM_PARAMS $(stream_params $STREAM_NR 240 30 250k)"
    VAR_STREAM_MAPS="$VAR_STREAM_MAPS $(var_stream_map $STREAM_NR 240p)"
    STREAM_NR=$((STREAM_NR + 1))
fi

# If 360p is available (height >= 360)
if [ "$VIDEO_HEIGHT" -ge 360 ]; then
    STREAM_MAPS="$STREAM_MAPS $(stream_maps)"
    STREAM_PARAMS="$STREAM_PARAMS $(stream_params $STREAM_NR 360 30 500k)"
    VAR_STREAM_MAPS="$VAR_STREAM_MAPS $(var_stream_map $STREAM_NR 360p)"
    STREAM_NR=$((STREAM_NR + 1))
fi

# If 480p is available (height >= 480)
if [ "$VIDEO_HEIGHT" -ge 480 ]; then
    STREAM_MAPS="$STREAM_MAPS $(stream_maps)"
    STREAM_PARAMS="$STREAM_PARAMS $(stream_params $STREAM_NR 480 30 1000k)"
    VAR_STREAM_MAPS="$VAR_STREAM_MAPS $(var_stream_map $STREAM_NR 480p)"
    STREAM_NR=$((STREAM_NR + 1))
fi

# If 720p is available (height >= 720)
if [ "$VIDEO_HEIGHT" -ge 720 ]; then
    STREAM_MAPS="$STREAM_MAPS $(stream_maps)"
    STREAM_PARAMS="$STREAM_PARAMS $(stream_params $STREAM_NR 720 30 3000k)"
    VAR_STREAM_MAPS="$VAR_STREAM_MAPS $(var_stream_map $STREAM_NR 720p)"
    STREAM_NR=$((STREAM_NR + 1))
fi

# If 1080p is available (height >= 1920 and fps >= 30)
if [ "$VIDEO_HEIGHT" -ge 1080 ]; then
    STREAM_MAPS="$STREAM_MAPS $(stream_maps)"
    STREAM_PARAMS="$STREAM_PARAMS $(stream_params $STREAM_NR 1080 30 6000k)"
    VAR_STREAM_MAPS="$VAR_STREAM_MAPS $(var_stream_map $STREAM_NR 1080p)"
    STREAM_NR=$((STREAM_NR + 1))
fi

# If 1080p60 is available (height >= 1920 and fps >= 60)
if [ "$VIDEO_HEIGHT" -ge 1080 ] && [ "$CAN_DO_60FPS" -eq 1 ]; then
    STREAM_MAPS="$STREAM_MAPS $(stream_maps)"
    STREAM_PARAMS="$STREAM_PARAMS $(stream_params $STREAM_NR 1080 60 120000k)"
    VAR_STREAM_MAPS="$VAR_STREAM_MAPS $(var_stream_map $STREAM_NR 1080p60)"
    STREAM_NR=$((STREAM_NR + 1))
fi

# If 1440p is available (height >= 1440)
if [ "$VIDEO_HEIGHT" -ge 2560 ]; then
    STREAM_MAPS="$STREAM_MAPS $(stream_maps)"
    STREAM_PARAMS="$STREAM_PARAMS $(stream_params $STREAM_NR 1440 60 24000k)"
    VAR_STREAM_MAPS="$VAR_STREAM_MAPS $(var_stream_map $STREAM_NR 1440p)"
    STREAM_NR=$((STREAM_NR + 1))
fi

# If 4k is available (height >= 2160)
if [ "$VIDEO_HEIGHT" -ge 3840 ]; then
    STREAM_MAPS="$STREAM_MAPS $(stream_maps)"
    STREAM_PARAMS="$STREAM_PARAMS $(stream_params $STREAM_NR 2160 60 48000k)"
    VAR_STREAM_MAPS="$VAR_STREAM_MAPS $(var_stream_map $STREAM_NR 4k)"
    STREAM_NR=$((STREAM_NR + 1))
fi

FALLBACK_VIDEO_ADDITIONAL_PARAMS=""
VIDEO_ALREADY_H264=$(echo "$VIDEO_CODEC" | grep -q "h264"; echo $?)
if [ "$VIDEO_ALREADY_H264" -eq 0 ]; then
  FALLBACK_VIDEO_ADDITIONAL_PARAMS="-c:v copy"
else
  FALLBACK_VIDEO_ADDITIONAL_PARAMS="-movflags faststart -c:v $H264_ENCODER -crf 22 -preset fast"
fi


echo "Start Encoding $FILE -> $FILE_NAME"
mkdir -p "$FILE_NAME"
time ffmpeg -hide_banner \
 $ADDITIONAL_PARAMS \
 -y -i "$FILE" \
 -c:a aac -crf 22 -preset fast -movflags faststart \
 $STREAM_MAPS \
 $STREAM_PARAMS \
 -var_stream_map "$VAR_STREAM_MAPS" \
 -hls_list_size 0 -hls_time "$HLS_TIME" -hls_playlist_type vod -hls_allow_cache 1 -hls_flags independent_segments \
 -master_pl_name playlist.m3u8 -hls_segment_filename "$FILE_NAME/%v/seg-%d.ts" \
 -f hls "$FILE_NAME/%v/index.m3u8" \
 $FALLBACK_VIDEO_ADDITIONAL_PARAMS -c:a aac "$FILE_NAME/video.mp4"\
 -vn "$FILE_NAME/audio.mp3" \
 -c:a libopus -rematrix_maxval 1.0 -ac 2 -vn "$FILE_NAME/audio.ogg"

echo "Encoding Completed"
