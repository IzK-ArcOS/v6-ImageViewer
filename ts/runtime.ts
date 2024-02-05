import { getAppById, spawnApp, spawnOverlay } from "$ts/apps";
import { AppRuntime } from "$ts/apps/runtime";
import { toBase64 } from "$ts/base64";
import { ImageViewerIcon } from "$ts/images/apps";
import { ImageMimeIcon } from "$ts/images/mime";
import { Process } from "$ts/process";
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

  constructor(app: App, mutator: AppMutator, process: Process) {
    super(app, mutator, process);

    this.openedFile.subscribe(async (v) => {
      if (!v) return;

      await this.readFile(v);
    })

    if (process.args.length && typeof process.args[0] === "string") {
      this.handleOpenFile(process.args[0])
    } else {
      this.openFile();
    }

    this.loadAltMenu(...ImageViewerAltMenu(this));
    this.process.accelerator.store.push(...ImageViewerAccelerators(this))
  }

  async readFile(v: string) {
    this.path.set(v);

    const { setDone, setErrors } = await this.LoadProgress(v);

    const file = await readFile(v);


    if (!file) {
      setErrors(1);
      setDone(1);
      return;
    }

    this.buffer.set(await file.data.text())
    this.File.set(file);
    this.url.set(URL.createObjectURL(file.data));
    this.setWindowTitle(file.name);
    this.setWindowIcon(getMimeIcon(file.name))

    setDone(1);

  }

  public openFile() {
    spawnOverlay(getAppById("LoadSaveDialog"), this.pid, [
      {
        title: "Select Image file to open",
        icon: ImageViewerIcon,
        extensions: MimeTypeIcons[ImageMimeIcon],
        startDir: getParentDirectory(this.path.get() || "./")
      },
    ]);
  }

  public openFileLocation() {
    const path = this.path.get();

    if (!path) return

    const split = path.split("/");
    const filename = split[split.length - 1];

    spawnApp("FileManager", 0, [path.replace(filename, "") || ".", path])
  }

  public setAsBackground() {
    if (!this.path.get()) return;

    const udata = UserDataStore.get();

    udata.sh.desktop.wallpaper = `@local:${toBase64(this.path.get())}`;

    UserDataStore.set(udata);
  }

  public async LoadProgress(v: string = this.path.get()) {
    return await FileProgress({
      caption: "Reading Image",
      subtitle: pathToFriendlyPath(v),
      icon: ImageMimeIcon,
      max: 1,
      done: 0,
      type: "quantity",
      waiting: false,
      working: true,
      errors: 0
    }, this.pid, false)
  }
}