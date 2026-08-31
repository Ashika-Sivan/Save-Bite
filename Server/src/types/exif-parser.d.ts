declare module "exif-parser" {
  export interface ExifTags {
    DateTimeOriginal?: number;
    CreateDate?: number;
    ModifyDate?: number;
    [key: string]: unknown;
  }

  export interface ExifResult {
    tags: ExifTags;
    imageSize?: {
      width: number;
      height: number;
    };
  }

  export interface Parser {
    parse(): ExifResult;
  }

  export function create(buffer: Buffer): Parser;
}
