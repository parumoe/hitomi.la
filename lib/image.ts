import { imageUrlCache } from "./cache";
import {
	getCommonImageId,
	imageIdFromHash,
	subdomainOffset,
	thumbPathFromHash,
} from "./gg";

const CDN_DOMAIN = "gold-usergeneratedcontent.net";
const REFERER = "https://hitomi.la/";

/**
 * 이미지 URL 생성 (30분 캐시)
 * @param hash 이미지 해시
 * @param isGif gif 여부
 * @returns 이미지 URL
 */
export async function getImageUrl(
	hash: string,
	isGif = false,
): Promise<string> {
	const cacheKey = `img:${hash}:${isGif}`;
	return imageUrlCache.getOrFetch(cacheKey, async () => {
		const type = isGif ? "webp" : "avif";
		const imageId = imageIdFromHash(hash);
		const offset = await subdomainOffset(imageId);
		const subDomain = isGif ? `w${offset + 1}` : `a${offset + 1}`;
		const commonId = await getCommonImageId();

		return `https://${subDomain}.${CDN_DOMAIN}/${commonId}${imageId}/${hash}.${type}`;
	});
}

/**
 * 썸네일 URL 생성 (30분 캐시)
 * @param hash 이미지 해시
 * @param isGif gif 여부
 * @returns 썸네일 URL
 */
export async function getThumbnailUrl(
	hash: string,
	isGif = false,
): Promise<string> {
	const cacheKey = `thumb:${hash}:${isGif}`;
	return imageUrlCache.getOrFetch(cacheKey, async () => {
		const type = isGif ? "webp" : "avif";
		const imageId = imageIdFromHash(hash);
		const offset = await subdomainOffset(imageId);
		const thumbSubDomain = `${String.fromCharCode("a".charCodeAt(0) + offset)}tn`;
		const thumbPath = thumbPathFromHash(hash);

		return `https://${thumbSubDomain}.${CDN_DOMAIN}/${type}bigtn/${thumbPath}/${hash}.${type}`;
	});
}

/**
 * 이미지 다운로드 (hash 기반)
 * @param hash 이미지 해시
 * @param isGif gif 여부
 * @returns Response 또는 Error
 */
export async function getImage(
	hash: string,
	isGif = false,
): Promise<Response | Error> {
	try {
		const url = await getImageUrl(hash, isGif);
		const res = await fetch(url, {
			headers: { referer: REFERER },
		});

		if (!res.ok) {
			return new Error(`HTTP ${res.status}: ${res.statusText}`);
		}

		return res;
	} catch (e) {
		return new Error(String(e));
	}
}

/**
 * 이미지를 ArrayBuffer로 다운로드
 * @param hash 이미지 해시
 * @param isGif gif 여부
 * @returns ArrayBuffer 또는 Error
 */
export async function getImageBuffer(
	hash: string,
	isGif = false,
): Promise<ArrayBuffer | Error> {
	const res = await getImage(hash, isGif);
	if (res instanceof Error) return res;

	try {
		return await res.arrayBuffer();
	} catch (e) {
		return new Error(String(e));
	}
}

/**
 * 이미지를 Blob으로 다운로드
 * @param hash 이미지 해시
 * @param isGif gif 여부
 * @returns Blob 또는 Error
 */
export async function getImageBlob(
	hash: string,
	isGif = false,
): Promise<Blob | Error> {
	const res = await getImage(hash, isGif);
	if (res instanceof Error) return res;

	try {
		return await res.blob();
	} catch (e) {
		return new Error(String(e));
	}
}

/**
 * 썸네일 다운로드
 * @param hash 이미지 해시
 * @param isGif gif 여부
 * @returns Response 또는 Error
 */
export async function getThumbnail(
	hash: string,
	isGif = false,
): Promise<Response | Error> {
	try {
		const url = await getThumbnailUrl(hash, isGif);
		const res = await fetch(url, {
			headers: { referer: REFERER },
		});

		if (!res.ok) {
			return new Error(`HTTP ${res.status}: ${res.statusText}`);
		}

		return res;
	} catch (e) {
		return new Error(String(e));
	}
}
