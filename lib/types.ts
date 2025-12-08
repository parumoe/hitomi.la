// Gallery 관련 타입 정의

export interface GalleryFile {
	haswebp: number;
	hasjxl: number;
	name: string;
	hash: string;
	height: number;
	hasavif: number;
	width: number;
}

export interface Language {
	name: string;
	galleryid: number;
	url: string;
	language_localname: string;
}

export interface Parody {
	url: string;
	parody: string;
}

export interface Tag {
	tag: string;
	url: string;
	male?: string;
	female?: string;
}

export interface Artist {
	url: string;
	artist: string;
}

export interface GalleryInfo {
	date: string;
	datepublished: string;
	language: string;
	videofilename: string | null;
	languages: Language[];
	related: number[];
	title: string;
	parodys: Parody[];
	blocked: number;
	scene_indexes: number[];
	galleryurl: string;
	language_url: string;
	japanese_title: string | null;
	video: string | null;
	tags: Tag[];
	artists: Artist[];
	groups: string[] | null;
	language_localname: string;
	type: string;
	characters: string[] | null;
	id: string;
	files: GalleryFile[];
}

export interface GalleryFileWithUrl extends GalleryFile {
	url: string;
	thumbnailUrl: string;
}
