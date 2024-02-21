import { SEP_ITEM } from "$state/Desktop/ts/store";
import { PersonalizationIcon } from "$ts/images/general";
import { ContextMenuItem } from "$types/app";
import { Runtime } from "./runtime";

export const ImageViewerAltMenu: (runtime: Runtime) => ContextMenuItem[] = (
  runtime: Runtime
): ContextMenuItem[] => [
  {
    caption: "File",
    subItems: [
      {
        icon: "file_open",
        caption: "Open...",
        action: () => runtime.openFile(),
        accelerator: "Alt+O",
      },
      {
        icon: "folder_open",
        caption: "Open file location",
        action: () => {
          runtime.openFileLocation();
        },
        disabled: () => !runtime.path.get(),
        accelerator: "Alt+Shift+O",
      },
      SEP_ITEM,
      {
        image: PersonalizationIcon,
        caption: "Set as wallpaper",
        action() {
          runtime.setAsBackground();
        },
      },
      SEP_ITEM,
      {
        caption: "Exit",
        action: () => {
          runtime.process.handler.kill(runtime.pid, true);
        },
        accelerator: "Alt+Q",
      },
    ],
  },
];
