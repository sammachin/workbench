
'use strict';

// Some settings you can edit easily
// Flows file name
const flowfile = 'flows.json';
// Start on the dashboard page
const url = "/admin";
// url for the editor page
const urledit = "/admin";


const os = require('os');
const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const {Menu, MenuItem, clipboard, Notification, ipcMain} = electron;
const Store = require('electron-store');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const ngrok = require('ngrok');



const isMac = process.platform === 'darwin'



// this should be placed at top of main.js to handle squirrel setup events quickly
if (handleSquirrelEvent()) { return; }

var http = require('http');
var express = require("express");
var RED = require("node-red");

// setup settings store
const store = new Store();

ipcMain.on('restart-request', (event, arg) => {
  console.log(arg)
  app.relaunch()
  app.exit()
})


// Create an Express app
var red_app = express();

// Create a server
var server = http.createServer(red_app);

const listenPort = store.get("settings.nodered-port") || "1880"; 


var userdir = app.getPath('userData');
var nodesdir = userdir + '/nodes';
if (!fs.existsSync(nodesdir)) {
    fs.mkdirSync(nodesdir);
}

// Create the settings object - see default settings.js file for other options
var settings = {
    verbose: true,
    httpAdminRoot:"/admin",
    httpNodeRoot: "/",
    userDir: userdir,
    nodesDir: nodesdir,
    flowFile: flowfile,
    functionGlobalContext: { },    // enables global context
    editorTheme: { projects: { enabled: false } },
    adminAuth : {
        type: "credentials",
        users: [{
            username: store.get("settings.nodered-username", "admin"), 
            password: store.get("settings.nodered-password", bcrypt.hashSync("password", 8)),
            permissions: "*"
        }]
}
};

// Initialise the runtime with a server and settings
RED.init(server,settings);

// Serve the editor UI from /red
red_app.use(settings.httpAdminRoot,RED.httpAdmin);

// Serve the http nodes UI from /api
red_app.use(settings.httpNodeRoot,RED.httpNode);

function openSettings() {
    const settingsWindow = new BrowserWindow({
      webPreferences: {
            nodeIntegration: true
      },
      width: 475,
      height: 675,
    })
    settingsWindow.once('ready-to-show', () => {
        settingsWindow.show()
    })
    settingsWindow.loadFile('settings.html')
    // settingsWindow.webContents.openDevTools()
  }

  let ngrokConnected = false;


  function toggleNgrok() {
    let ngrokOpts = {
      proto: 'http', 
      addr: store.get("settings.nodered-port", "1880"),
      auth: store.get("settings.ngrok-auth", ""),
      subdomain: store.get("settings.ngrok-subdomain", ""),
      authtoken: store.get("settings.ngrok-authtoken", ""),
      region: store.get("settings.ngrok-region", "us"),
      binPath : path => path.replace('app.asar', 'app.asar.unpacked')
    }
    if (!ngrokConnected){
      (async function() {
        const url = await ngrok.connect(ngrokOpts);
        process.env.EXTERNAL_HOSTNAME = new URL(url).hostname;
        ngrokConnected = true
        ngrokToast(url, ngrokConnected)
        template[4].submenu[0].label = url
        template[4].submenu[0].click = function(){clipboard.writeText(url, 'selection')}
        template[4].submenu[0].enabled = true
        template[4].submenu[4].enabled = true
        template[4].submenu[2].label = "Disconnect"
        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
      })();
    } else{
      (async function() {
        const url = await ngrok.disconnect();
        ngrokConnected = false
        process.env.EXTERNAL_HOSTNAME = "";
        ngrokToast(null, ngrokConnected)
        template[4].submenu[0].label = "Not Connected"
        template[4].submenu[0].enabled = false
        template[4].submenu[4].enabled = false
        template[4].submenu[2].label = "Connect"
        const menu = Menu.buildFromTemplate(template)
        Menu.setApplicationMenu(menu)
      })();
    }
    
  }
  
  function inspectNgrok(){
    let ngrokWin = new BrowserWindow({ width: 1024, height: 768 })
    ngrokWin.on('closed', () => {
      ngrokWin = null
    })
    ngrokWin.loadURL('http://127.0.0.1:4040')
  }
  
  
  function ngrokToast(url, connected){
    if (connected){
      const options = {
        title : 'Connected',
        body : url
      }
      let notification = new Notification(options)
      notification.show()
    } else {
      const options = {
        title : 'Disconnected',
        silent : true
      }
      let notification = new Notification(options)
      notification.show()
    }
    
  }
  

// Create the Application's main menu
var template = [
    ...(isMac ? [{
        label: app.name,
        submenu: [
          { role: 'about' },
          { type: 'separator' },
          { label: 'Settings', click: openSettings },
          { type: 'separator' },
          { role: 'services' },
          { type: 'separator' },
          { role: 'hide' },
          { role: 'hideothers' },
          { role: 'unhide' },
          { type: 'separator' },
          { role: 'quit' }
        ]
      }] : []),
      {
        label: 'File',
        submenu: [...(isMac ? [{ role: 'close' }] : [{ label: 'Settings', click: openSettings }, { role: 'quit' } ])]
      },
    { label: "Edit", submenu: [
        { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
        { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
        { type: "separator" },
        { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
    ]}, 
    { label: 'View', submenu: [
        { label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click(item, focusedWindow) { if (focusedWindow) focusedWindow.reload(); }
        },
        { label: 'Toggle Developer Tools',
            accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
            click(item, focusedWindow) { if (focusedWindow) focusedWindow.webContents.toggleDevTools(); }
        },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
        { role: 'minimize' }
    ]},
    { label: 'ngrok', submenu: [
          { label: 'Not Connected', enabled: false},
          { type: 'separator' },
          {
            label: 'Connect',
            click: function(){
              toggleNgrok ();
            }
          },
          { type: 'separator' },
          {
            label: 'Inspector',
            enabled: false,
            click: function(){
              inspectNgrok ();
            }
          }
          
        ]
    },
    { label: 'Help', submenu: [
        
        { label: 'Node-RED Documentation',
        click() { require('electron').shell.openExternal('http://nodered.org/docs') }
        },
        { label: 'Flows and Nodes',
        click() { require('electron').shell.openExternal('http://flows.nodered.org') }
        },
        { label: "Log Settings Store",
        click() { console.log(store.get()) }
        }
    ]}, 
];

let mainWindow;
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        autoHideMenuBar: true,
        webPreferences: {
            nodeIntegration: false
        },
        title: "Node-RED",
        fullscreenable: true,
        width: 1200,
        height: 800,
        icon: __dirname + "/nodered.png"
    });
    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
    
    var webContents = mainWindow.webContents;
    webContents.on('did-get-response-details', function(event, status, newURL, originalURL, httpResponseCode) {
        if ((httpResponseCode == 404) && (newURL == ("http://localhost:"+listenPort+url))) {
            setTimeout(webContents.reload, 200);
        }
        
    });

     mainWindow.webContents.on("new-window", function(e, url, frameName, disposition, options) {
        // if a child window opens... modify any other options such as width/height, etc
        // in this case make the child overlap the parent exactly...
        var w = mainWindow.getBounds();
        options.x = w.x;
        options.y = w.y;
        options.width = w.width;
        options.height = w.height;
        //re-use the same child name so all "2nd" windows use the same one.
        //frameName = "child";
    })

    // Emitted when the window is closed.
    mainWindow.on('closed', function() {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null;
    });
}

// Called when Electron has finished initialization and is ready to create browser windows.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    //if (process.platform !== 'darwin') {
    //    app.quit();
    //}
});

app.on('activate', function() {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
        mainWindow.loadURL("http://127.0.0.1:"+listenPort+url);
    }
});

// Start the Node-RED runtime, then load the inital page
RED.start().then(function() {
    server.listen(listenPort,"127.0.0.1",function() {
        mainWindow.loadURL("http://127.0.0.1:"+listenPort+url);
    });
});

///////////////////////////////////////////////////////
// All this Squirrel stuff is for the Windows installer
function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');
  const path = require('path');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};
