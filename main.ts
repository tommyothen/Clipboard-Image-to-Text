import { app, Tray, Menu, BrowserWindow, globalShortcut } from "electron";
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
    const { data: { text }} = await worker.recognize("https://tesseract.projectnaptha.com/img/eng_bw.png");

    console.log(text);
  });

  new BrowserWindow({ show: false });
  console.log("App is ready!");
});

app.on("will-quit", () => {
  worker.terminate()
});
