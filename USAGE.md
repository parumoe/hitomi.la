# 사용 방법 (Usage)

`@paruchan/hitomi.la` 라이브러리의 주요 기능 사용법입니다.

## 설치 (Installation)

```bash
# bun
bun add @paruchan/hitomi.la

# npm
npm install @paruchan/hitomi.la
```

## 기본 사용법

### 1. 갤러리 정보 가져오기

`getRawGallery` 또는 `getGalleryMetadata`를 사용하여 갤러리의 상세 정보를 가져올 수 있습니다.
반환값은 `Promise<GalleryInfo | Error>` 입니다. 오류 발생 시 `Error` 객체가 반환되므로 반드시 확인해야 합니다.

```typescript
import { getGalleryMetadata } from "@paruchan/hitomi.la";

const galleryId = 1234567; // 조회할 갤러리 ID
const metadata = await getGalleryMetadata(galleryId);

if (metadata instanceof Error) {
  console.error("오류 발생:", metadata);
} else {
  console.log("제목:", metadata.title);
  console.log("태그:", metadata.tags);
  console.log("언어:", metadata.language.name);
}
```

### 2. 이미지 목록 및 URL 가져오기

`getGalleryFiles`를 사용하면 갤러리의 모든 이미지 파일 정보와 다운로드 가능한 URL을 한 번에 가져올 수 있습니다.
반환값은 `Promise<GalleryFileWithUrl[] | Error>` 입니다.

```typescript
import { getGalleryFiles } from "@paruchan/hitomi.la";

const galleryId = 1234567;
const files = await getGalleryFiles(galleryId);

if (files instanceof Error) {
  console.error("오류 발생:", files);
} else {
  // 첫 번째 이미지 정보 출력
  const firstImage = files[0];
  console.log("파일명:", firstImage.name);
  console.log("이미지 URL:", firstImage.url);
  console.log("썸네일 URL:", firstImage.thumbnailUrl);
}
```

### 3. 특정 이미지 다운로드

이미지 URL만 필요한 것이 아니라 실제 파일 데이터(Blob, ArrayBuffer)가 필요한 경우 다음 함수들을 사용할 수 있습니다.
- `getImageBuffer`: `Promise<ArrayBuffer | Error>` 반환
- `getImageBlob`: `Promise<Blob | Error>` 반환

```typescript
import { getImageBlob, getImageBuffer } from "@paruchan/hitomi.la";

// 파일 해시 정보는 getGalleryFiles 등을 통해 얻을 수 있습니다.
const hash = "이미지_해시_값"; 

// 1. ArrayBuffer로 다운로드
const buffer = await getImageBuffer(hash);
if (!(buffer instanceof Error)) {
  console.log("다운로드 완료, 크기:", buffer.byteLength);
}

// 2. Blob으로 다운로드
const blob = await getImageBlob(hash);
if (!(blob instanceof Error)) {
  console.log("Blob 타입:", blob.type);
}
```

### 4. 기타 유틸리티

#### 관련 갤러리 찾기

```typescript
import { getRelatedGallery } from "@paruchan/hitomi.la";

const relatedIds = await getRelatedGallery(1234567);
console.log("관련 갤러리 ID 목록:", relatedIds);
```

#### 갤러리 태그만 가져오기

```typescript
import { getGalleryTags } from "@paruchan/hitomi.la";

const tags = await getGalleryTags(1234567);
console.log(tags);
```

주요 인터페이스 구조는 다음과 같습니다.

### GalleryInfo

`getGalleryMetadata`, `getRawGallery`가 반환하는 타입입니다.

```typescript
interface GalleryInfo {
  id: string;                 // 갤러리 ID
  title: string;              // 제목
  japanese_title: string | null; // 일본어 제목 (있을 경우)
  type: string;               // 종류 (doujinshi, manga, artistcg 등)
  language: string;           // 언어 (korean, english 등)
  date: string;               // 등록일
  
  files: GalleryFile[];       // 이미지 파일 목록
  tags: Tag[];               // 태그 목록
  artists: Artist[];         // 작가 목록
  characters: string[] | null;// 캐릭터 목록
  groups: string[] | null;    // 그룹 목록
  parodys: Parody[];         // 패러디 원작 목록
  
  galleryurl: string;         // 갤러리 URL
  // ... 기타 내부 필드
}
```

### GalleryFileWithUrl

`getGalleryFiles`가 반환하는 배열의 아이템 타입입니다.

```typescript
interface GalleryFileWithUrl {
  name: string;          // 파일명 (예: "1.jpg")
  hash: string;          // 이미지 해시
  width: number;         // 너비
  height: number;        // 높이
  haswebp: number;       // WebP 지원 여부
  hasavif: number;       // AVIF 지원 여부
  
  url: string;           // 다운로드 가능한 이미지 URL
  thumbnailUrl: string;  // 썸네일 URL
}
```

### 기타 타입

```typescript
interface Tag {
  tag: string;           // 태그명
  url: string;           // 태그 페이지 URL
  male?: string;         // 남성 태그 여부 ("1" or undefined)
  female?: string;       // 여성 태그 여부 ("1" or undefined)
}

interface Artist {
  artist: string;        // 작가명
  url: string;           // 작가 페이지 URL
}
```
