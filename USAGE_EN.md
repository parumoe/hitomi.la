# Usage

This is the usage documentation for the `@paruchan/hitomi.la` library.

## Installation

```bash
# bun
bun add @paruchan/hitomi.la

# npm
npm install @paruchan/hitomi.la
```

## Basic Usage

### 1. Get Gallery Information

You can use `getRawGallery` or `getGalleryMetadata` to retrieve detailed information about a gallery.
Returns `Promise<GalleryInfo | Error>`. You must check if the returned value is an `Error` object.

```typescript
import { getGalleryMetadata } from "@paruchan/hitomi.la";

const galleryId = 1234567; // Gallery ID to query
const metadata = await getGalleryMetadata(galleryId);

if (metadata instanceof Error) {
  console.error("Error occurred:", metadata);
} else {
  console.log("Title:", metadata.title);
  console.log("Tags:", metadata.tags);
  console.log("Language:", metadata.language.name);
}
```

### 2. Get Image List and URLs

Use `getGalleryFiles` to retrieve all image file information and downloadable URLs for a gallery at once.
Returns `Promise<GalleryFileWithUrl[] | Error>`.

```typescript
import { getGalleryFiles } from "@paruchan/hitomi.la";

const galleryId = 1234567;
const files = await getGalleryFiles(galleryId);

if (files instanceof Error) {
  console.error("Error occurred:", files);
} else {
  // Print information about the first image
  const firstImage = files[0];
  console.log("Filename:", firstImage.name);
  console.log("Image URL:", firstImage.url);
  console.log("Thumbnail URL:", firstImage.thumbnailUrl);
}
```

### 3. Download Specific Images

If you need the actual file data (Blob, ArrayBuffer) rather than just the URL, you can use the following functions.
- `getImageBuffer`: Returns `Promise<ArrayBuffer | Error>`
- `getImageBlob`: Returns `Promise<Blob | Error>`

```typescript
import { getImageBlob, getImageBuffer } from "@paruchan/hitomi.la";

// You can get the hash from getGalleryFiles or similar functions
const hash = "IMAGE_HASH_VALUE"; 

// 1. Download as ArrayBuffer
const buffer = await getImageBuffer(hash);
if (!(buffer instanceof Error)) {
  console.log("Download complete, size:", buffer.byteLength);
}

// 2. Download as Blob
const blob = await getImageBlob(hash);
if (!(blob instanceof Error)) {
  console.log("Blob type:", blob.type);
}
```

### 4. Other Utilities

#### Find Related Galleries

```typescript
import { getRelatedGallery } from "@paruchan/hitomi.la";

const relatedIds = await getRelatedGallery(1234567);
console.log("Related Gallery IDs:", relatedIds);
```

#### Get Gallery Tags Only

```typescript
import { getGalleryTags } from "@paruchan/hitomi.la";

const tags = await getGalleryTags(1234567);
console.log(tags);
```

Here represent the structure of key interfaces.

### GalleryInfo

Returned by `getGalleryMetadata` and `getRawGallery`.

```typescript
interface GalleryInfo {
  id: string;                 // Gallery ID
  title: string;              // Title
  japanese_title: string | null; // Japanese Title (if available)
  type: string;               // Type (doujinshi, manga, artistcg, etc.)
  language: string;           // Language (korean, english, etc.)
  date: string;               // Date Uploaded
  
  files: GalleryFile[];       // List of Image Files
  tags: Tag[];               // List of Tags
  artists: Artist[];         // List of Artists
  characters: string[] | null;// List of Characters
  groups: string[] | null;    // List of Groups
  parodys: Parody[];         // List of Parodies
  
  galleryurl: string;         // Gallery URL
  // ... other internal fields
}
```

### GalleryFileWithUrl

Item type of the array returned by `getGalleryFiles`.

```typescript
interface GalleryFileWithUrl {
  name: string;          // Filename (e.g., "1.jpg")
  hash: string;          // Image Hash
  width: number;         // Width
  height: number;        // Height
  haswebp: number;       // WebP Support
  hasavif: number;       // AVIF Support
  
  url: string;           // Downloadable Image URL
  thumbnailUrl: string;  // Thumbnail URL
}
```

### Other Types

```typescript
interface Tag {
  tag: string;           // Tag Name
  url: string;           // Tag Page URL
  male?: string;         // Male Tag Flag ("1" or undefined)
  female?: string;       // Female Tag Flag ("1" or undefined)
}

interface Artist {
  artist: string;        // Artist Name
  url: string;           // Artist Page URL
}
```
