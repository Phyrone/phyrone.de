import type { RequestHandler } from "./$types";
import { error, json } from "@sveltejs/kit";
import { createReadableStream } from "@sveltejs/kit/node";
import sharp from "sharp";
import profile_url from "$assets/profile.png?url";
import { z } from "zod";
import etag from "etag";
import qs from "qs";

sharp.cache({
	files: 200,
	memory: 1024 * 1024 * 64,
	items: 512,
});
const QueryParams = z.object({
	size: z.number({ coerce: true }).finite().positive().gte(8).lte(2048),
}).partial();

type QueryParams = z.infer<typeof QueryParams>;

const ImageExtension = z.enum([
	"png",
	"jpg",
	"jpeg",
	"webp",
	"avif",
	"gif",
	"tiff",
	"heif",
]);

let loaded_img: sharp.Sharp | undefined = undefined;

export const GET: RequestHandler = async ({ params: { ext }, fetch, url }) => {
	const image_ext = ImageExtension.safeParse(ext);
	const query = await QueryParams.parseAsync(qs.parse(url.search, {
		ignoreQueryPrefix: true,
	})).catch((err) => {
		error(400, {
			message: err.message,
		});
	});
	if (!loaded_img) {
		loaded_img = sharp(
			await fetch(profile_url)
				.then((res) => res.bytes()),
			{},
		);
	}

	let image = loaded_img.clone();
	if (query.size) {
		image.resize(query.size, query.size);
	}

	const image_ext_data = image_ext.data;
	if (image_ext_data) {
		let effort;
		switch (image_ext_data) {
			case "webp":
				effort = 6;
				break;
			case "avif":
			//case "heif":
				effort = 9;
			case "png":
			case "gif":
				effort = 10;
				break;
			default:
				effort = undefined;
		}
		image.toFormat(image_ext.data, {
			effort,
			bitdepth: 8,
			//@ts-ignore
			preset: "icon",
			compression: "av1",
		});
	} else {
		error(400, `Invalid image format: ${ext}`);
	}

	const encoded = await image.toBuffer();
	return new Response(encoded, {
		headers: {
			"Content-Type": `image/${image_ext_data}`,
			"Etag": etag(encoded),
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
};
