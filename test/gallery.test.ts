import { describe, expect, test } from "bun:test";
import {
	getGalleryFiles,
	getGalleryLanguages,
	getGalleryMetadata,
	getGalleryTags,
	getRawGallery,
	getRelatedGallery,
} from "../index";

const TEST_GALLERY_ID = 3098263;

describe("Gallery", () => {
	test("getRawGallery - 갤러리 원본 데이터 가져오기", async () => {
		const data = await getRawGallery(TEST_GALLERY_ID);

		expect(data).not.toBeInstanceOf(Error);
		if (data instanceof Error) return;

		expect(data.id).toBe(String(TEST_GALLERY_ID));
		expect(data.title).toBeDefined();
		expect(data.files).toBeArray();
		expect(data.files.length).toBeGreaterThan(0);
	});

	test("getRelatedGallery - 관련 갤러리 ID 목록", async () => {
		const related = await getRelatedGallery(TEST_GALLERY_ID);

		expect(related).not.toBeInstanceOf(Error);
		if (related instanceof Error) return;

		expect(related).toBeArray();
		expect(related.every((id) => typeof id === "number")).toBe(true);
	});

	test("getGalleryTags - 갤러리 태그 목록", async () => {
		const tags = await getGalleryTags(TEST_GALLERY_ID);

		expect(tags).not.toBeInstanceOf(Error);
		if (tags instanceof Error) return;

		expect(tags).toBeArray();
		if (tags.length > 0) {
			expect(tags[0]).toHaveProperty("tag");
			expect(tags[0]).toHaveProperty("url");
		}
	});

	test("getGalleryLanguages - 갤러리 언어 목록", async () => {
		const languages = await getGalleryLanguages(TEST_GALLERY_ID);

		expect(languages).not.toBeInstanceOf(Error);
		if (languages instanceof Error) return;

		expect(languages).toBeArray();
		if (languages.length > 0) {
			expect(languages[0]).toHaveProperty("name");
			expect(languages[0]).toHaveProperty("galleryid");
			expect(languages[0]).toHaveProperty("url");
			expect(languages[0]).toHaveProperty("localname");
		}
	});

	test("getGalleryFiles - 갤러리 파일 목록 (URL 포함)", async () => {
		const files = await getGalleryFiles(TEST_GALLERY_ID);

		expect(files).not.toBeInstanceOf(Error);
		if (files instanceof Error) return;

		expect(files).toBeArray();
		expect(files.length).toBeGreaterThan(0);

		const firstFile = files[0];
		if (!firstFile) throw new Error("No files found");
		expect(firstFile).toHaveProperty("name");
		expect(firstFile).toHaveProperty("hash");
		expect(firstFile).toHaveProperty("width");
		expect(firstFile).toHaveProperty("height");
		expect(firstFile).toHaveProperty("url");
		expect(firstFile).toHaveProperty("thumbnailUrl");
		expect(firstFile.url).toMatch(/^https:\/\//);
		expect(firstFile.thumbnailUrl).toMatch(/^https:\/\//);
	});

	test("getGalleryMetadata - 갤러리 메타데이터", async () => {
		const metadata = await getGalleryMetadata(TEST_GALLERY_ID);

		expect(metadata).not.toBeInstanceOf(Error);
		if (metadata instanceof Error) return;

		expect(metadata.id).toBe(String(TEST_GALLERY_ID));
		expect(metadata.title).toBeDefined();
		expect(metadata.artists).toBeArray();
		expect(metadata.language).toHaveProperty("name");
		expect(metadata.type).toBeDefined();
	});

	test("getRawGallery - 존재하지 않는 갤러리 에러 처리", async () => {
		const data = await getRawGallery(999999999);
		expect(data).toBeInstanceOf(Error);
	});
});
