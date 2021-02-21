import { app, Tray, Menu, BrowserWindow } from "electron";
import { createWorker } from "tesseract.js";
import * as path from "path";

const worker = createWorker();

app.on("ready", async () => {
  const tray = new Tray(path.join(__dirname, "../icon.png"));
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]));

  new BrowserWindow({ show: false });
  console.log("App is ready!");
});