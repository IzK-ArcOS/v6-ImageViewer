import { AppKeyCombinations } from "$types/accelerator";
import { Runtime } from "./runtime";

export const ImageViewerAccelerators: (runtime: Runtime) => AppKeyCombinations = (runtime) => {
  return [
    {
      key: "o",
      alt: true,
      shift: true,
      action() {
        runtime.openFileLocation();
      },
    },
    {
      key: "o",
      alt: true,
      action() {
        runtime.openFile();
      },
    },
    {
      key: "a",
      alt: true,
      shift: true,
      action() {
        runtime.setAsBackground();
      },
    },
  ];
};
