import { describe, expect, test } from "bun:test";
import {
	getGalleryFiles,
	getImage,
	getImageBlob,
	getImageBuffer,
	getImageUrl,
	getThumbnail,
	getThumbnailUrl,
} from "../index";

const TEST_GALLERY_ID = 3098263;
const REFERER = "https://hitomi.la/";

describe("Image URL", () => {
	test("getImageUrl - 이미지 URL 생성", async () => {
		const files = await getGalleryFiles(TEST_GALLERY_ID);
		expect(files).not.toBeInstanceOf(Error);
		if (files instanceof Error) return;

		const file = files[0];
		if (!file) throw new Error("No files found");
		const url = await getImageUrl(file.hash, false);

		expect(url).toMatch(/^https:\/\//);
		expect(url).toContain(".avif");
		expect(url).toContain("gold-usergeneratedcontent.net");
	});

	test("getThumbnailUrl - 썸네일 URL 생성", async () => {
		const files = await getGalleryFiles(TEST_GALLERY_ID);
		expect(files).not.toBeInstanceOf(Error);
		if (files instanceof Error) return;

		const file = files[0];
		if (!file) throw new Error("No files found");
		const url = await getThumbnailUrl(file.hash, false);

		expect(url).toMatch(/^https:\/\//);
		expect(url).toContain(".avif");
		expect(url).toContain("bigtn");
	});

	test("getGalleryFiles URL 유효성 검증", async () => {
		const files = await getGalleryFiles(TEST_GALLERY_ID);
		expect(files).not.toBeInstanceOf(Error);
		if (files instanceof Error) return;

		const file = files[0];
		if (!file) throw new Error("No files found");

		// HEAD 요청으로 URL 유효성 확인
		const res = await fetch(file.url, {
			method: "HEAD",
			headers: { referer: REFERER },
		});

		expect(res.status).toBe(200);
	});
});

describe("Image Download", () => {
	test("getImage - Response 반환", async () => {
		const files = await getGalleryFiles(TEST_GALLERY_ID);
		expect(files).not.toBeInstanceOf(Error);
		if (files instanceof Error) return;

		const file = files[0];
		if (!file) throw new Error("No files found");
		const res = await getImage(file.hash, false);

		expect(res).not.toBeInstanceOf(Error);
		if (res instanceof Error) return;

		expect(res.ok).toBe(true);
		expect(res.headers.get("content-type")).toContain("image");
	});

	test("getImageBuffer - ArrayBuffer 반환", async () => {
		const files = await getGalleryFiles(TEST_GALLERY_ID);
		expect(files).not.toBeInstanceOf(Error);
		if (files instanceof Error) return;

		const file = files[0];
		if (!file) throw new Error("No files found");
		const buffer = await getImageBuffer(file.hash, false);

		expect(buffer).not.toBeInstanceOf(Error);
		if (buffer instanceof Error) return;

		expect(buffer).toBeInstanceOf(ArrayBuffer);
		expect(buffer.byteLength).toBeGreaterThan(0);
	});

	test("getImageBlob - Blob 반환", async () => {
		const files = await getGalleryFiles(TEST_GALLERY_ID);
		expect(files).not.toBeInstanceOf(Error);
		if (files instanceof Error) return;

		const file = files[0];
		if (!file) throw new Error("No files found");
		const blob = await getImageBlob(file.hash, false);

		expect(blob).not.toBeInstanceOf(Error);
		if (blob instanceof Error) return;

		expect(blob).toBeInstanceOf(Blob);
		expect(blob.size).toBeGreaterThan(0);
	});

	test("getThumbnail - 썸네일 다운로드", async () => {
		const files = await getGalleryFiles(TEST_GALLERY_ID);
		expect(files).not.toBeInstanceOf(Error);
		if (files instanceof Error) return;

		const file = files[0];
		if (!file) throw new Error("No files found");
		const res = await getThumbnail(file.hash, false);

		expect(res).not.toBeInstanceOf(Error);
		if (res instanceof Error) return;

		expect(res.ok).toBe(true);
		expect(res.headers.get("content-type")).toContain("image");
	});
});
