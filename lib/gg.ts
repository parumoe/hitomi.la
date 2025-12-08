import { ggScriptCache } from "./cache";

const LTN_URL = "https://ltn.gold-usergeneratedcontent.net";
const _CDN_DOMAIN = "gold-usergeneratedcontent.net";

interface GGScript {
	subdomainOffsetDefault: number;
	subdomainOffsetMap: Map<number, number>;
	commonImageId: string;
}

/**
 * gg.js 스크립트를 가져와서 파싱 (1분 캐시)
 */
async function fetchGGScript(): Promise<GGScript> {
	return ggScriptCache.getOrFetch("gg-script", async () => {
		const response = await fetch(`${LTN_URL}/gg.js?_=${Date.now()}`);
		const ggScript = await response.text();

		// var o = (숫자) 패턴에서 기본 offset 추출
		const defaultMatch = /var o = (\d)/.exec(ggScript);
		const subdomainOffsetDefault = defaultMatch?.[1]
			? parseInt(defaultMatch[1], 10)
			: 0;

		// o = (숫자); break; 패턴에서 특정 case의 offset 추출
		const oMatch = /o = (\d); break;/.exec(ggScript);
		const o = oMatch?.[1] ? parseInt(oMatch[1], 10) : 0;

		// case (숫자): 패턴들 추출
		const subdomainOffsetMap = new Map<number, number>();
		const caseMatches = ggScript.matchAll(/case (\d+):/g);
		for (const match of caseMatches) {
			if (match[1]) {
				const caseNum = parseInt(match[1], 10);
				subdomainOffsetMap.set(caseNum, o);
			}
		}

		// b: '...' 패턴에서 commonImageId 추출
		const bMatch = /b: '(.+)'/.exec(ggScript);
		const commonImageId = bMatch?.[1] ? bMatch[1] : "";

		return {
			subdomainOffsetDefault,
			subdomainOffsetMap,
			commonImageId,
		} as GGScript;
	}) as Promise<GGScript>;
}

/**
 * hash에서 imageId 추출 (s 함수)
 * @param hash 이미지 해시
 * @returns imageId
 */
function imageIdFromHash(hash: string): number {
	const match = /(..)(.)$/.exec(hash);
	if (!match || !match[1] || !match[2]) return 0;
	return parseInt(match[2] + match[1], 16);
}

/**
 * subdomain offset 계산 (m 함수)
 * @param imageId 이미지 ID
 * @returns offset 값
 */
async function subdomainOffset(imageId: number): Promise<number> {
	const script = await fetchGGScript();
	return (
		script.subdomainOffsetMap.get(imageId) ?? script.subdomainOffsetDefault
	);
}

/**
 * commonImageId 반환 (b 값)
 */
async function getCommonImageId(): Promise<string> {
	const script = await fetchGGScript();
	return script.commonImageId;
}

/**
 * 썸네일 경로 생성
 * @param hash 이미지 해시
 * @returns 썸네일 경로
 */
function thumbPathFromHash(hash: string): string {
	return hash.replace(/^.*(..)(.)$/, "$2/$1");
}

export {
	fetchGGScript,
	imageIdFromHash,
	subdomainOffset,
	getCommonImageId,
	thumbPathFromHash,
};
