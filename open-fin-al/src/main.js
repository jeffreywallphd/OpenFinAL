// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require("fs");
const ipcMain = require('electron').ipcMain;

//////////////////////////// Core Electron Section ////////////////////////////

let win;           // main window
let urlWindow;     // url window

// TODO: try to remove nodeIntegration, as it may create security vulnerabilities
const createWindow = () => {
  win = new BrowserWindow({ 
    show: false,
    webPreferences: {
      preload: path.join(app.getAppPath(), 'src/preload.js'),
      contextIsolation: true,
      nodeIntegration: true
    } 
  });
  //win.setMenu(null); // this doesn't allow opening developer tools
  win.maximize();
  win.show();

  win.webContents.setWindowOpenHandler(() => {
    //shell.openExternal(url);
    return { action: 'deny' };
  });

  win.loadFile(path.join(app.getAppPath(), 'public/index.html'));
};

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});

// securely open a new Electron window with a URL
// 🔒 Prevents access to Node.js
// 🔒 Prevents direct access to Electron internals
// 🔒 Enables Chromium's sandbox
// 🔒 Disables remote module
// 🚫 No preload script
const createUrlWindow = (url) => {
  urlWindow = new BrowserWindow({
    show: false,
    parent: win,
    title: 'Open FinAL',
    webPreferences: {
      nodeIntegration: false,     
      contextIsolation: true,     
      sandbox: true,              
      enableRemoteModule: false,  
      preload: undefined         
    }
  });

  urlWindow.maximize();
  urlWindow.show();

  urlWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  urlWindow.loadURL(url);
  urlWindow.on('closed', () => {
    urlWindow = null;
  });
};

// Listen for the renderer process to request opening second window
ipcMain.on('open-url-window', (event, url) => {
  if (!urlWindow) {
    createUrlWindow(url);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

//////////////////////////// Database Section ////////////////////////////
const userDataPath = app.getPath('userData');
const dbFileName = 'my-app-database.sqlite';
const dbPath = path.join(userDataPath, dbFileName);

if (!fs.existsSync(userDataPath)) {
  fs.mkdirSync(userDataPath, { recursive: true });
}

let db;

const initDatabase = async () => {
  try {
    //dbPath = './src/Asset/DB/OpenFinAL.db';
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to the database.');
      }
    });
    const schema = await fs.promises.readFile('./src/Asset/DB/schema.sql', 'utf-8');
    await db.exec(schema);
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

initDatabase();

ipcMain.handle('select-data', async (event, args) => {
  const data = await selectFromDatabase(args["query"], args["inputData"]);
  return data;
});

const selectFromDatabase = async (query, dataArray) => {
  return new Promise((resolve, reject) => {
    const data = [];

    try {
      //execute the query
      db.all(query, dataArray, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        // Convert rows to array of objects
        rows.forEach((row) => data.push(row));
        resolve(data);
      });
    } catch (err) {
      reject(err);
    } 
  });
};

ipcMain.handle('sqlite-query', async (event, args) => {
  const data = await sqliteQuery(args["query"], args["parameters"]);
  return data;
});

const sqliteQuery = async (query, dataArray) => {
  return new Promise((resolve, reject) => {
    const data = [];

    try {
      //execute the query
      db.all(query, dataArray, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        // Convert rows to array of objects
        rows.forEach((row) => data.push(row));
        resolve(data);
      });
    } catch (err) {
      reject(err);
    } 
  });
};

ipcMain.handle('sqlite-get', async (event, args) => {
  const data = await sqliteGet(args["query"], args["parameters"]);
  return data;
});

const sqliteGet = async (query, dataArray) => {
  return new Promise((resolve, reject) => {
    try {
      //execute the query
      db.get(query, dataArray, (err, data) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(data);
      });
    } catch (err) {
      reject(err);
    } 
  });
};

ipcMain.handle('sqlite-insert', async (event, args) => {
  const data = await sqliteRun(args["query"], args["parameters"]);
  return data;
});

ipcMain.handle('sqlite-update', async (event, args) => {
  const data = await sqliteRun(args["query"], args["parameters"]);
  return data;
});

ipcMain.handle('sqlite-delete', async (event, args) => {
  const data = await sqliteRun(args["query"], args["parameters"]);
  return data;
});

const sqliteRun = async (query, dataArray) => {
  return new Promise((resolve, reject) => {
    try {
      //execute the query
      db.run(query, dataArray, (err, data) => {
        if (err) {
          reject(err);
          return;
        }

        resolve(data);
      });
    } catch (err) {
      reject(err);
    } 
  });
};
