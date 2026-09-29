const { app, BrowserWindow, ipcMain, screen } = require("electron");

const path = require("node:path");

const { testDatabase } = require("./database/connection.cjs");

const songService = require("./services/songService.cjs");

let operatorWindow = null;
let displayWindow = null;

const isDevelopment = !app.isPackaged;

/*
|--------------------------------------------------------------------------
| Renderer URL
|--------------------------------------------------------------------------
*/

function rendererURL(route = "") {
  if (isDevelopment) {
    return `http://localhost:5173${route}`;
  }

  return `file://${path.join(__dirname, "../dist/index.html")}${route}`;
}

/*
|--------------------------------------------------------------------------
| Window diagnostics
|--------------------------------------------------------------------------
*/

function attachWindowDiagnostics(window, name) {
  window.webContents.on("did-start-loading", () => {
    console.log(`[${name}] started loading`);
  });

  window.webContents.on("did-finish-load", () => {
    console.log(`[${name}] finished loading`);

    console.log(`[${name}] URL:`, window.webContents.getURL());
  });

  window.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription, validatedURL) => {
      console.error(`[${name}] FAILED TO LOAD`);

      console.error({
        errorCode,
        errorDescription,
        validatedURL,
      });
    },
  );

  window.webContents.on("render-process-gone", (event, details) => {
    console.error(`[${name}] RENDERER CRASHED`);

    console.error(details);
  });

  window.webContents.on(
    "console-message",
    (event, level, message, line, sourceId) => {
      console.log(`[${name} console]`, message, `(${sourceId}:${line})`);
    },
  );
}

/*
|--------------------------------------------------------------------------
| Operator Window
|--------------------------------------------------------------------------
*/

function createOperatorWindow() {
  operatorWindow = new BrowserWindow({
    width: 1400,

    height: 900,

    minWidth: 1100,

    minHeight: 700,

    show: false,

    backgroundColor: "#1e1e1e",

    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),

      contextIsolation: true,

      nodeIntegration: false,

      sandbox: false,
    },
  });

  attachWindowDiagnostics(operatorWindow, "OPERATOR");

  const url = rendererURL("/");

  console.log("Loading operator:", url);

  operatorWindow.loadURL(url);

  operatorWindow.once("ready-to-show", () => {
    console.log("Operator ready");

    operatorWindow.show();
  });

  operatorWindow.on("closed", () => {
    operatorWindow = null;
  });
}

/*
|--------------------------------------------------------------------------
| Display Window
|--------------------------------------------------------------------------
*/

function createDisplayWindow() {
  const displays = screen.getAllDisplays();

  console.log("Available displays:", displays.length);

  displays.forEach((display, index) => {
    console.log(`Display ${index}:`, {
      id: display.id,
      bounds: display.bounds,
      workArea: display.workArea,
      scaleFactor: display.scaleFactor,
    });
  });

  const targetDisplay = displays.length > 1 ? displays[1] : displays[0];

  if (!targetDisplay) {
    console.error("No display detected.");

    return;
  }

  console.log("Using display:", targetDisplay.id);

  displayWindow = new BrowserWindow({
    x: targetDisplay.bounds.x,

    y: targetDisplay.bounds.y,

    width: targetDisplay.bounds.width,

    height: targetDisplay.bounds.height,

    show: false,

    backgroundColor: "#000000",

    autoHideMenuBar: true,

    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),

      contextIsolation: true,

      nodeIntegration: false,

      sandbox: false,
    },
  });

  attachWindowDiagnostics(displayWindow, "DISPLAY");

  const url = rendererURL("/#/display");

  console.log("Loading display:", url);

  displayWindow.loadURL(url);

  displayWindow.once("ready-to-show", () => {
    console.log("Display ready");

    displayWindow.show();

    /*
     * Do NOT enable fullscreen yet.
     *
     * First confirm that the display
     * renderer actually renders.
     *
     * Once working, we can enable:
     *
     * displayWindow.setFullScreen(true);
     */
  });

  displayWindow.on("closed", () => {
    displayWindow = null;
  });
}

/*
|--------------------------------------------------------------------------
| IPC
|--------------------------------------------------------------------------
*/

function registerIPC() {
  ipcMain.handle("songs:list", async (_, search) => {
    return songService.getSongs(search || "");
  });

  ipcMain.handle("songs:get", async (_, id) => {
    return songService.getSong(Number(id));
  });

  ipcMain.handle("songs:create", async (_, song) => {
    return songService.createSong(song);
  });

  ipcMain.handle("songs:delete", async (_, id) => {
    return songService.deleteSong(Number(id));
  });

  ipcMain.handle("display:show-slide", async (_, slide) => {
    console.log("IPC display:show-slide:", slide);

    if (!displayWindow) {
      console.error("Display window does not exist.");

      return false;
    }

    if (displayWindow.isDestroyed()) {
      console.error("Display window is destroyed.");

      return false;
    }

    displayWindow.webContents.send("display:slide", slide);

    return true;
  });

  ipcMain.handle("songs:update", async (_, id, song) => {
    return songService.updateSong(Number(id), song);
  });

  ipcMain.handle("display:clear", async () => {
    console.log("IPC display:clear");

    if (!displayWindow) {
      return false;
    }

    if (displayWindow.isDestroyed()) {
      return false;
    }

    displayWindow.webContents.send("display:clear");

    return true;
  });
}

/*
|--------------------------------------------------------------------------
| Electron Ready
|--------------------------------------------------------------------------
*/

app.whenReady().then(async () => {
  console.log("Electron ready");

  console.log("Electron version:", process.versions.electron);

  console.log("Chrome version:", process.versions.chrome);

  console.log("Platform:", process.platform);

  try {
    await testDatabase();

    console.log("Database connected.");
  } catch (error) {
    console.error("Database connection failed:", error);
  }

  registerIPC();

  createOperatorWindow();

  createDisplayWindow();
});

/*
|--------------------------------------------------------------------------
| App lifecycle
|--------------------------------------------------------------------------
*/

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createOperatorWindow();

    createDisplayWindow();
  }
});
