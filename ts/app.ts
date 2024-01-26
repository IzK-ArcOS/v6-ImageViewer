import { ImageViewerIcon } from "$ts/images/apps";
import { App } from "$types/app";
import AppSvelte from "../App.svelte";
import { Runtime } from "./runtime";

export const ImageViewer: App = {
  metadata: {
    name: "Image Viewer",
    description: "View images in ArcOS",
    author: "The ArcOS Team",
    version: "3.0.0",
    icon: ImageViewerIcon
  },
  runtime: Runtime,
  content: AppSvelte,
  id: "ImageViewer",
  size: { w: 640, h: 480 },
  minSize: { w: 300, h: 200 },
  maxSize: { w: 1200, h: 800 },
  pos: { x: 150, y: 150 },
  state: {
    minimized: false,
    maximized: false,
    headless: false,
    fullscreen: false,
    resizable: true
  },
  controls: {
    minimize: true,
    maximize: true,
    close: true
  },
  glass: true
}