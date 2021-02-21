import { app, Tray, Menu, BrowserWindow, globalShortcut, clipboard, Notification } from "electron";
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
      const { data: { text, confidence }} = await worker.recognize(clipboard.readImage().toPNG());

      clipboard.writeText(text);

      new Notification({
        title: 'Successfully Copied Text!',
        body: `Text extracted with ${confidence}% confidence.`,
      }).show();
    }
  });

  new BrowserWindow({ show: false });
  new Notification({
    title: 'Clipboard Image to Text Extractor',
    body: 'The image to text service has started!',
  }).show();
});

app.on("will-quit", () => {
  worker.terminate()
});
