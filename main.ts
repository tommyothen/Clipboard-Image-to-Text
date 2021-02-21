import { app, Tray, Menu, BrowserWindow, globalShortcut, clipboard } from "electron";
import { createWorker } from "tesseract.js";
import * as path from "path";

const worker = createWorker();

app.on("ready", async () => {
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  const tray = new Tray(path.join(__dirname, "../icon.png"));
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]));

  globalShortcut.register("Alt+Shift+S", async () => {
    const formats = clipboard.availableFormats("clipboard");

    if (formats.includes("image/png") || formats.includes("image/jpeg")) {
      const { data: { text }} = await worker.recognize(clipboard.readImage().toPNG());

      clipboard.writeText(text);
    }
  });

  new BrowserWindow({ show: false });
  console.log("App is ready!");
});

app.on("will-quit", () => {
  worker.terminate()
});
