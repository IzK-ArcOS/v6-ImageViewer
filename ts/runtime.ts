import { getAppById, spawnApp, spawnOverlay } from "$ts/apps";
import { AppRuntime } from "$ts/apps/runtime";
import { toBase64 } from "$ts/base64";
import { ImageViewerIcon } from "$ts/images/apps";
import { ErrorIcon } from "$ts/images/dialog";
import { ImageMimeIcon, SvgMimeIcon } from "$ts/images/mime";
import { Process } from "$ts/process";
import { createErrorDialog } from "$ts/process/error";
import { getParentDirectory } from "$ts/server/fs/dir";
import { readFile } from "$ts/server/fs/file";
import { getMimeIcon } from "$ts/server/fs/mime";
import { FileProgress } from "$ts/server/fs/progress";
import { pathToFriendlyPath } from "$ts/server/fs/util";
import { MimeTypeIcons } from "$ts/stores/filesystem";
import { UserDataStore } from "$ts/stores/user";
import { Store } from "$ts/writable";
import type { App, AppMutator } from "$types/app";
import { ArcFile } from "$types/fs";
import { ImageViewerAccelerators } from "./accelerators";
import { ImageViewerAltMenu } from "./altmenu";

export class Runtime extends AppRuntime {
  public File = Store<ArcFile>();
  public buffer = Store<string>();
  public path = Store<string>();
  public url = Store<string>();
  public fileLoadFromAlt = false;

  constructor(app: App, mutator: AppMutator, process: Process) {
    super(app, mutator, process);

    this.openedFile.subscribe(async (v) => {
      if (!v) return;

      await this.readFile(v);
    });

    if (process.args.length && typeof process.args[0] === "string") {
      this.handleOpenFile(process.args[0]);
    } else {
      this.openFile();
    }

    this.loadAltMenu(...ImageViewerAltMenu(this));
    this.process.accelerator.store.push(...ImageViewerAccelerators(this));
  }

  async readFile(v: string) {
    this.path.set(v);

    const { setDone } = await this.LoadProgress(v);

    const file = await readFile(v);

    if (!file) {
      setDone(1);
      createErrorDialog(
        {
          title: "Can't open image",
          message: `ArcOS failed to load the image. Please check if the file exists, and try again.`,
          buttons: [
            {
              caption: "Okay",
              action: () => {
                if (!this.fileLoadFromAlt) this.closeApp();
                else this.openFile();
              },
              suggested: true,
            },
          ],
          image: ErrorIcon,
          sound: "arcos.dialog.error",
        },
        this.pid,
        true
      );
      return;
    }

    this.buffer.set(await file.data.text());
    this.File.set(file);
    this.url.set(URL.createObjectURL(file.data));
    this.setWindowTitle(file.name);
    this.setWindowIcon(getMimeIcon(file.name));

    setDone(1);
  }

  public openFile() {
    this.fileLoadFromAlt = true;
    spawnOverlay(getAppById("LoadSaveDialog"), this.pid, [
      {
        title: "Select Image file to open",
        icon: ImageViewerIcon,
        extensions: [...MimeTypeIcons[ImageMimeIcon], ...MimeTypeIcons[SvgMimeIcon]],
        startDir: getParentDirectory(this.path.get() || "./"),
      },
    ]);
  }

  public openFileLocation() {
    const path = this.path.get();

    if (!path) return;

    const split = path.split("/");
    const filename = split[split.length - 1];

    spawnApp("FileManager", 0, [path.replace(filename, "") || ".", path]);
  }

  public setAsBackground() {
    if (!this.path.get()) return;

    const path = this.path.get();
    const udata = UserDataStore.get();
    const base64 = toBase64(path);

    if (base64 == path) return;

    udata.sh.desktop.wallpaper = `@local:${base64}`;

    UserDataStore.set(udata);
  }

  public async LoadProgress(v: string = this.path.get()) {
    return await FileProgress(
      {
        caption: "Reading Image",
        subtitle: pathToFriendlyPath(v),
        icon: ImageMimeIcon,
        max: 1,
        done: 0,
        type: "quantity",
        waiting: false,
        working: true,
        errors: 0,
      },
      this.pid,
      false
    );
  }
}
