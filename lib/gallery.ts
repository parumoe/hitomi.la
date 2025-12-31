import { galleryCache } from "./cache";
import { getImageUrl, getThumbnailUrl } from "./image";
import type { GalleryFileWithUrl, GalleryInfo, Tag } from "./types";

const LTN_URL = "https://ltn.gold-usergeneratedcontent.net";

/**
 * 갤러리 원본 데이터 가져오기 (10분 캐시)
 */
export async function getRawGallery(id: number): Promise<GalleryInfo | Error> {
	const cacheKey = `gallery:${id}`;
	const cached = galleryCache.get(cacheKey) as GalleryInfo | undefined;
	if (cached) return cached;

	try {
		const text = await fetch(`${LTN_URL}/galleries/${id}.js`).then((res) =>
			res.text(),
		);
		const jsonStr = text.replace(/^var galleryinfo = /, "");
		const data = JSON.parse(jsonStr) as GalleryInfo;
		galleryCache.set(cacheKey, data);
		return data;
	} catch (e) {
		return new Error(String(e));
	}
}

/**
 * 관련 갤러리 ID 목록
 */
export async function getRelatedGallery(id: number): Promise<number[] | Error> {
	const data = await getRawGallery(id);
	if (data instanceof Error) return data;
	return data.related;
}

/**
 * 갤러리 태그 목록
 */
export async function getGalleryTags(id: number): Promise<Tag[] | Error> {
	const data = await getRawGallery(id);
	if (data instanceof Error) return data;
	return data.tags;
}

/**
 * 갤러리 언어 목록
 */
export async function getGalleryLanguages(id: number) {
	const data = await getRawGallery(id);
	if (data instanceof Error) return data;

	return data.languages.map((lang) => ({
		name: lang.name,
		galleryid: lang.galleryid,
		url: lang.url,
		localname: lang.language_localname,
	}));
}

/**
 * 갤러리 파일 목록 (URL 포함)
 */
export async function getGalleryFiles(
	id: number,
): Promise<GalleryFileWithUrl[] | Error> {
	const data = await getRawGallery(id);
	if (data instanceof Error) return data;

	const filesWithUrls = await Promise.all(
		data.files.map(async (file): Promise<GalleryFileWithUrl> => {
			const isGif = file.name.endsWith(".gif");
			return {
				...file,
				url: await getImageUrl(file.hash, isGif),
				thumbnailUrl: await getThumbnailUrl(file.hash, isGif),
			};
		}),
	);

	return filesWithUrls;
}

/**
 * 갤러리 메타데이터
 */
export async function getGalleryMetadata(id: number) {
	const data = await getRawGallery(id);
	if (data instanceof Error) return data;

	return {
		id: data.id,
		title: data.title,
		artists: data.artists.map((a) => ({
			url: a.url,
			name: a.artist,
		})),
		characters: data.characters,
		galleryurl: data.galleryurl,
		japanese_title: data.japanese_title,
		date: data.date,
		datepublished: data.datepublished,
		language: {
			name: data.language,
			localname: data.language_localname,
			url: data.language_url,
		},
		type: data.type,
		parodys: data.parodys,
		tags: data.tags,
		groups: data.groups,
		blocked: data.blocked,
		scene_indexes: data.scene_indexes,
		video: data.video,
		videofilename: data.videofilename,
	};
}
