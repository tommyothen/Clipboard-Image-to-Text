import { app, Tray, Menu } from "electron";
import * as path from "path";

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
});