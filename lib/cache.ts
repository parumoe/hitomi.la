/**
 * 간단한 인메모리 캐시 시스템
 */

interface CacheEntry<T> {
	value: T;
	expiry: number;
}

class Cache<T> {
	private cache = new Map<string, CacheEntry<T>>();
	private defaultTTL: number;

	/**
	 * @param defaultTTL 기본 TTL (밀리초), 기본값 5분
	 */
	constructor(defaultTTL = 5 * 60 * 1000) {
		this.defaultTTL = defaultTTL;
	}

	/**
	 * 캐시에서 값 가져오기
	 */
	get(key: string): T | undefined {
		const entry = this.cache.get(key);
		if (!entry) return undefined;

		if (Date.now() > entry.expiry) {
			this.cache.delete(key);
			return undefined;
		}

		return entry.value;
	}

	/**
	 * 캐시에 값 저장
	 * @param key 캐시 키
	 * @param value 저장할 값
	 * @param ttl TTL (밀리초), 미지정시 기본값 사용
	 */
	set(key: string, value: T, ttl?: number): void {
		this.cache.set(key, {
			value,
			expiry: Date.now() + (ttl ?? this.defaultTTL),
		});
	}

	/**
	 * 캐시에서 값 삭제
	 */
	delete(key: string): boolean {
		return this.cache.delete(key);
	}

	/**
	 * 캐시 전체 삭제
	 */
	clear(): void {
		this.cache.clear();
	}

	/**
	 * 만료된 항목 정리
	 */
	cleanup(): void {
		const now = Date.now();
		for (const [key, entry] of this.cache) {
			if (now > entry.expiry) {
				this.cache.delete(key);
			}
		}
	}

	/**
	 * 캐시 크기 반환
	 */
	get size(): number {
		return this.cache.size;
	}

	/**
	 * 캐시된 값 가져오거나, 없으면 fetcher로 가져와서 캐싱
	 */
	async getOrFetch(
		key: string,
		fetcher: () => Promise<T>,
		ttl?: number,
	): Promise<T> {
		const cached = this.get(key);
		if (cached !== undefined) return cached;

		const value = await fetcher();
		this.set(key, value, ttl);
		return value;
	}
}

// 싱글톤 캐시 인스턴스들
export const ggScriptCache = new Cache<unknown>(24 * 60 * 60 * 1000); // gg.js는 24시간
export const galleryCache = new Cache<unknown>(24 * 60 * 60 * 1000); // 갤러리 데이터는 24시간
export const imageUrlCache = new Cache<string>(7 * 24 * 60 * 60 * 1000); // 이미지 URL은 7일

export { Cache };
