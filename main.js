const electron = require('electron');
const {autoUpdater} = require("electron-updater");
const ipcMain = electron.ipcMain;
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

const path = require('path');
const url = require('url');
const registerRoutes = require('./backend/electron-api');

const {refresh}  = require("./backend/models/post");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

registerRoutes();

startPostsSync();

function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({width: 800, height: 600,frame: false});

    mainWindow.setFullScreen(true);

    const startUrl = url.format({
        pathname: path.join(__dirname, '/build/index.html'),
        protocol: 'file:',
        slashes: true
    });

    // and load the index.html of the app.
    mainWindow.loadURL(startUrl);

    // Open the DevTools.
    // mainWindow.webContents.openDevTools();

    // Emitted when the window is closed.
    mainWindow.on('closed', function () {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    });

    setInterval(()=>{
        autoUpdater.checkForUpdates();
    },90000);

}
//Update checker
autoUpdater.on('update-downloaded', (info) => {
    // win.webContents.send('updateReady');
    console.log("Update",info);
    autoUpdater.quitAndInstall();
});

// ipcMain.on("quitAndInstall", (event, arg) => {
//     // autoUpdater.quitAndInstall();
// });

// ipcMain.on("updateReady", (event, arg) => {
//     // autoUpdater.quitAndInstall();
// });
// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
});

function startPostsSync() {


        refresh().then((result)=>{
            mainWindow.webContents.send('posts-loaded', result);

            setInterval(async ()=>{

                if(true) {
                    let postsDidChange = await refresh();

                    if(postsDidChange.status) {
                        mainWindow.webContents.send('posts-changed', postsDidChange);
                    }
                }

                // mainWindow.webContents.send('posts-changed', postsDidChange);
            },5000);
        });
}

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.