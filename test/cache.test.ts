import { beforeEach, describe, expect, test } from "bun:test";
import type { GalleryInfo } from "../index";
import {
	galleryCache,
	getImageUrl,
	getRawGallery,
	getThumbnailUrl,
} from "../index";

const TEST_GALLERY_ID = 3098263;

describe("Cache Performance", () => {
	beforeEach(() => {
		// 각 테스트 전에 캐시 초기화
		galleryCache.clear();
	});

	test("getRawGallery - 연속 요청 시 캐시 성능 (첫 요청 vs 캐시된 요청)", async () => {
		// 첫 번째 요청 (네트워크 요청)
		const start1 = performance.now();
		const result1 = await getRawGallery(TEST_GALLERY_ID);
		const time1 = performance.now() - start1;

		expect(result1).not.toBeInstanceOf(Error);
		if (result1 instanceof Error) return;

		console.log(`첫 번째 요청 (네트워크): ${time1.toFixed(2)}ms`);

		// 두 번째 요청 (캐시된 데이터)
		const start2 = performance.now();
		const result2 = await getRawGallery(TEST_GALLERY_ID);
		const time2 = performance.now() - start2;

		expect(result2).not.toBeInstanceOf(Error);
		if (result2 instanceof Error) return;

		console.log(`두 번째 요청 (캐시): ${time2.toFixed(2)}ms`);
		console.log(`캐시 TTL: 24시간`);

		// 데이터가 동일해야 함
		expect((result2 as GalleryInfo).id).toBe((result1 as GalleryInfo).id);

		// 캐시된 요청이 훨씬 빨라야 함
		expect(time2).toBeLessThan(time1);
		console.log(`성능 개선: ${(time1 / time2).toFixed(1)}배 빨라짐`);
	});

	test("getRawGallery - 여러 번 연속 요청하면 캐시 히트", async () => {
		const results: (GalleryInfo | Error)[] = [];
		const times: number[] = [];

		// 5번 연속 요청
		for (let i = 0; i < 5; i++) {
			const start = performance.now();
			const result = await getRawGallery(TEST_GALLERY_ID);
			const time = performance.now() - start;

			results.push(result);
			times.push(time);
			console.log(`요청 ${i + 1}: ${time.toFixed(2)}ms`);
		}

		// 모든 결과가 성공해야 함
		expect(results.every((r) => !(r instanceof Error))).toBe(true);

		// 첫 요청이 가장 느려야 함
		const maxTime = Math.max(...times);
		expect(times[0]).toBe(maxTime);

		// 2번째 이후는 1번째보다 훨씬 빨아야 함 (최소 5배)
		const firstTime = times[0];
		if (firstTime === undefined) return;
		const cachedTimes = times.slice(1);
		expect(cachedTimes.every((t) => t < firstTime / 5)).toBe(true);

		console.log(
			`평균 캐시된 요청: ${(cachedTimes.reduce((a, b) => a + b, 0) / cachedTimes.length).toFixed(2)}ms`,
		);
	});

	test("getImageUrl - 연속 요청 시 캐시 성능", async () => {
		const testHash = "8fe1e7c12caa8a16aa0ab4cd67c24f";

		// 첫 번째 요청
		const start1 = performance.now();
		const url1 = await getImageUrl(testHash, false);
		const time1 = performance.now() - start1;

		console.log(`첫 번째 URL 요청: ${time1.toFixed(2)}ms`);

		// 두 번째 요청 (캐시)
		const start2 = performance.now();
		const url2 = await getImageUrl(testHash, false);
		const time2 = performance.now() - start2;

		console.log(`두 번째 URL 요청 (캐시): ${time2.toFixed(2)}ms`);

		// URL이 동일해야 함
		expect(url1).toBe(url2);

		// 캐시된 요청이 빨라야 함
		expect(time2).toBeLessThan(time1);
		console.log(`성능 개선: ${(time1 / time2).toFixed(1)}배 빨라짐`);
	});

	test("getThumbnailUrl - 같은 해시에 대해 캐시 적용", async () => {
		const testHash = "8fe1e7c12caa8a16aa0ab4cd67c24f";

		// 썸네일 URL 요청 여러 번
		const times: number[] = [];

		for (let i = 0; i < 3; i++) {
			const start = performance.now();
			await getThumbnailUrl(testHash, false);
			const time = performance.now() - start;
			times.push(time);
			console.log(`썸네일 요청 ${i + 1}: ${time.toFixed(2)}ms`);
		}

		// 첫 요청이 가장 느려야 함
		const time0 = times[0];
		const time1 = times[1];
		const time2 = times[2];
		if (time0 !== undefined && time1 !== undefined && time2 !== undefined) {
			expect(time0 >= time1).toBe(true);
			expect(time1 >= time2).toBe(true);
		}
	});

	test("캐시 크기 확인", async () => {
		const initialSize = galleryCache.size;
		console.log(`초기 캐시 크기: ${initialSize}`);

		// 갤러리 데이터 추가
		await getRawGallery(TEST_GALLERY_ID);
		const afterGallery = galleryCache.size;
		console.log(`갤러리 요청 후: ${afterGallery}`);

		// 같은 갤러리 다시 요청 (캐시 크기 변화 없음)
		await getRawGallery(TEST_GALLERY_ID);
		const afterSecond = galleryCache.size;
		console.log(`같은 갤러리 재요청 후: ${afterSecond}`);

		expect(afterGallery).toBe(afterSecond);
	});

	test("다양한 이미지 해시의 URL 캐싱", async () => {
		const hashes = [
			"8fe1e7c12caa8a16aa0ab4cd67c24f",
			"7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c",
			"1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c",
		];

		const times: number[] = [];

		// 첫 요청: 각 해시별로 생성
		for (const hash of hashes) {
			const start = performance.now();
			await getImageUrl(hash, false);
			times.push(performance.now() - start);
		}

		console.log(
			`첫 요청들 (네트워크): ${times.map((t) => t.toFixed(2)).join(", ")}ms`,
		);

		// 두 번째 요청: 캐시에서 가져오기
		const cachedTimes: number[] = [];
		for (const hash of hashes) {
			const start = performance.now();
			await getImageUrl(hash, false);
			cachedTimes.push(performance.now() - start);
		}

		console.log(
			`재요청 (캐시): ${cachedTimes.map((t) => t.toFixed(2)).join(", ")}ms`,
		);

		// 캐시된 요청들이 더 빨아야 함
		for (let i = 0; i < hashes.length; i++) {
			const cachedTime = cachedTimes[i];
			const firstTime = times[i];
			if (cachedTime !== undefined && firstTime !== undefined) {
				expect(cachedTime).toBeLessThan(firstTime);
			}
		}
	});
});
