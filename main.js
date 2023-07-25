const { app, BrowserWindow, ipcMain } = require("electron")
const path = require("path")
const url = require("url")
const fs = require("fs")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    autoHideMenuBar: true,
    width: 1116,
    height: 1006,
    webPreferences: {
      nodeIntegration: true, // is default value after Electron v5
      contextIsolation: false, // protect against prototype pollution
      enableRemoteModule: false, // turn on remote
      // preload: path.join(__dirname, "preload.js") // use a preload script
      // preload: path.join(app.getAppPath(), 'preload.js')
    },
  })

  // Load app
  win.loadFile(path.join(__dirname, "index.html"))

  // rest of code..
  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
}

// let mainWindow

// function createWindow() {
//     // Create the browser window.
//     mainWindow = new BrowserWindow({
//         width: 800,
//         height: 600,
//         backgroundColor: "#ccc",
//         webPreferences: {
//             nodeIntegration: true, // to allow require
//             contextIsolation: false, // allow use with Electron 12+
//             preload: path.join(__dirname, 'preload.js')
//         }
//     })

//     // and load the index.html of the app.
//     mainWindow.loadURL(url.format({
//         pathname: path.join(__dirname, 'index.html'),
//         protocol: 'file:',
//         slashes: true
//     }))

//     // Open the DevTools.
//     // mainWindow.webContents.openDevTools()

//     // Emitted when the window is closed.
//     mainWindow.on('closed', function() {
//         // Dereference the window object, usually you would store windows
//         // in an array if your app supports multi windows, this is the time
//         // when you should delete the corresponding element.
//         mainWindow = null
//     })
// }

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// app.whenReady().then(() => {
//     createWindow()

//     app.on('activate', function () {
//       if (BrowserWindow.getAllWindows().length === 0) createWindow()
//     })
// })

app.whenReady().then(() => {
  createWindow()
})

// app.on('ready', createWindow)

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  app.quit()
})

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
