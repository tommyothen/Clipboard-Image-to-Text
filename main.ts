import { app, Tray, Menu, BrowserWindow, globalShortcut, clipboard, Notification } from "electron";
import { createWorker } from "tesseract.js";
import * as path from "path";

const worker = createWorker();

const showNotification = async ({title, body, ms = 5000}: {title: string, body: string, ms?: number}) => {
  return new Promise((resolve, reject) => {
    // Create the notification
    const notif = new Notification({
      title,
      body
    });

    // Show the video then create a timeout to close it
    notif.show();
    (new Promise(r => setTimeout(r, ms)))
      .then(() => notif.close())
      .then(() => resolve(true));
  });
}

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

      showNotification({
        title: 'Successfully Copied Text!',
        body: `Text extracted with ${confidence}% confidence.`,
      });
    } else {
      showNotification({
        title: 'No Images Found!',
        body: 'Could not find any images in the clipboard.',
      });
    }
  });

  new BrowserWindow({ show: false });
  showNotification({
    title: 'Clipboard Image to Text Extractor',
    body: 'The image to text service has started!',
    ms: 10000,
  });
});

app.on("will-quit", () => {
  worker.terminate()
});
