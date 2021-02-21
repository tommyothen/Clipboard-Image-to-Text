import { app, Tray, Menu, BrowserWindow, globalShortcut, clipboard, Notification } from "electron";
import { createWorker } from "tesseract.js";
import * as path from "path";

// Create a tesseract worker
const worker = createWorker();

// Function to show a notification and close it after x milliseconds
const showNotification = async ({title, body, ms = 5000}: {title: string, body: string, ms?: number}) => {
  return new Promise((resolve) => {
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

// Handler for when the app is ready
app.on("ready", async () => {
  // Load the worker with the English language
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  // Create an icon in the system tray
  const tray = new Tray(path.join(__dirname, "../icon.png"));
  tray.setToolTip("Clipboard Image to Text");
  tray.setContextMenu(Menu.buildFromTemplate([
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]));

  // Add a keyboard shortcut to process an image
  globalShortcut.register("Alt+Shift+S", async () => {
    try {
      // Grab the format of the most recent item from the clipboard
      const formats = clipboard.availableFormats("clipboard");

      // Check if the clipboard has an image
      if (formats.includes("image/png") || formats.includes("image/jpeg")) {

        // Try to process the image
        const { data: { text, confidence} } = await worker.recognize(clipboard.readImage().toPNG());

        // Copy the text to the clipboard
        clipboard.writeText(text);

        // Tell the user the confidence percentage of the extracted text
        showNotification({
          title: 'Successfully Copied Text!',
          body: `Text extracted with ${confidence}% confidence.`,
        });

      } else {
        // No image could be found in the clipboard
        showNotification({
          title: 'No Images Found!',
          body: 'Could not find any images in the clipboard.',
        });
      }
    } catch (error) {
      // Catch any errors and send them to the user
      showNotification({
        title: 'Something went wrong!',
        body: `Please try again soon...`,
      });
    }
  });

  // Electron needs a browser window to create a system tray
  new BrowserWindow({ show: false });

  // Tell the user that the service has started
  showNotification({
    title: 'Clipboard Image to Text Extractor',
    body: 'The image to text service has started!',
    ms: 10000,
  });
});

// Make sure to fully quit the app and remove all workers
app.on("will-quit", () => {
  globalShortcut.unregisterAll();
  worker.terminate();
});
