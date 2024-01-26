import { ImageMimeIcon } from "$ts/images/mime";
import { openFileWithApp } from "$ts/server/fs/open";
import { MimeTypeIcons } from "$ts/stores/filesystem";
import { FileHandler } from "$types/fs";

export const ImageViewerHandler: FileHandler = {
  extensions: MimeTypeIcons[ImageMimeIcon],
  name: "View Image",
  image: ImageMimeIcon,
  description: "Open the image in Image Viewer",
  handler(file) {
    openFileWithApp("ImageViewer", file);
  }
}