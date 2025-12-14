// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

const { app, BrowserWindow, shell, session } = require('electron');

//Handle squirrel events for install/update and quit immediately
if (require('electron-squirrel-startup')) {
  app.quit();
}

const path = require('path');
const fs = require("fs");

const handleSquirrelEvent = () => {
  if (process.argv.length === 1) return false;

  const squirrelEvent = process.argv[1];

  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      app.quit();
      return true;

    case '--squirrel-uninstall':
      // 💥 Custom cleanup logic
      const appDataPath = path.join(app.getPath('appData'), 'OpenFinAL');
      deleteFolderRecursiveSync(appDataPath); // Use the recursive delete function
      app.quit();
      return true;

    case '--squirrel-obsolete':
      app.quit();
      return true;
  }

  return false;
};

const deleteFolderRecursiveSync = (folderPath) => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const currentPath = path.join(folderPath, file);
      if (fs.lstatSync(currentPath).isDirectory()) {
        // Recursive call for subdirectories
        deleteFolderRecursiveSync(currentPath);
      } else {
        // Delete file
        fs.unlinkSync(currentPath);
      }
    });
    // Delete the empty directory
    fs.rmdirSync(folderPath);
  }
};

handleSquirrelEvent();

const os = require('os');
const ipcMain = require('electron').ipcMain;
const sqlite3 = require('sqlite3').verbose();
const Database = require('better-sqlite3');
const puppeteer = require('puppeteer');
const keytar = require('keytar');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require("crypto");
const tls = require("tls");
const neo4j = require('neo4j-driver');
const { spawn, exec, execFile } = require("child_process");
//const yf = require("yahoo-finance2").default; //causing a module load error. Using code below to dynamically import yahoo-finance2

let yf;
function getYF() {
  if (!yf) {
    yf = import('yahoo-finance2').then(m => m.default || m);
  }
  return yf;
}

// Migration function
async function runMigrations() {
  try {
    if (!betterDb) {
      return;
    }
    
    const migrationsPath = path.join(__dirname, 'Database', 'migrations');
    const { MigrationManager } = require('./Database/MigrationManager');
    const migrationManager = new MigrationManager(betterDb, migrationsPath);
    
    await migrationManager.runMigrations();
  } catch (error) {
    throw error;
  }
}

//////////////////////////// Main Electron Window Section ////////////////////////////

let win;           // main window
let urlWindow;     // url window
 
//change userData folder name from open-fin-al to OpenFinal and make folder
app.setPath('userData', path.join(app.getPath('appData'), 'OpenFinAL'));
if (!fs.existsSync(app.getPath('userData'))) {
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
}

//get the username of the current user
const getUsername = () => {
  try {
    const userInfo = os.userInfo();
    const username = userInfo.username;
    return username;
  } catch(error) {
    return "Guest";
  }
}

getUsername();

ipcMain.handle('get-username', (event) => {
  return getUsername();
});

// TODO: try to remove nodeIntegration, as it may create security vulnerabilities
const createWindow = () => {
  win = new BrowserWindow({ 
    show: false,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    } 
  });

  if (process.env.NODE_ENV === 'production') {
    //temporarily commented this out. Add back eventually.
    //win.setMenu(null); //remove default electron menu in production
  }

  win.maximize();
  win.show();

  //stop the main window from opening links to external sites
  win.webContents.setWindowOpenHandler(() => { return { action: 'deny' }; });

  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY); 
};

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          `default-src 'self';
          script-src 'self' 'unsafe-eval'; 
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.gstatic.com https://cdnjs.cloudflare.com; 
          img-src 'self' data: https://*.gstatic.com https://www.investors.com https://imageio.forbes.com https://www.reuters.com https://image.cnbcfm.com https://ml-eu.globenewswire.com https://mma.prnewswire.com https://cdn.benzinga.com https://www.benzinga.com https://editorial-assets.benzinga.com https://contributor-assets.benzinga.com https://staticx-tuner.zacks.com https://media.ycharts.com https://g.foolcdn.com https://ml.globenewswire.com https://images.cointelegraph.com https://s3.cointelegraph.com https://cdn.i-scmp.com https://smallfarmtoday.com/ https://thearorareport.com https://cdn.content.foolcdn.com https://www.marketbeat.com; 
          font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; 
          connect-src 'self' http://localhost:3001 https://cdn.jsdelivr.net https://huggingface.co https://*.huggingface.co https://*.hf.co https://*.xethub.hf.co https://cdn-lfs.huggingface.co;`
        ],
      },
    });
  });

  startAPIFetcher();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
});

//////////////////////////// External URL Electron Window Section ////////////////////////////

// securely open a new Electron window with a URL
// 🔒 Prevents access to Node.js
// 🔒 Prevents direct access to Electron internals
// 🔒 Enables Chromium's sandbox
// 🔒 Disables remote module
// 🚫 No preload script
const createUrlWindow = (url, { hidden = false } = {}) => {
  const win2 = new BrowserWindow({
    show: false,
    parent: hidden ? null : win,
    title: 'Open FinAL',
    webPreferences: {
      nodeIntegration: false,     
      contextIsolation: true,     
      sandbox: true,              
      enableRemoteModule: false,  
      preload: path.join(app.getAppPath(), 'src/urlWindowPreload.js')      
    }
  });

  if(!hidden) {
    win2.maximize();
    win2.show();
    urlWindow = win2;
  }

  win2.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  win2.loadURL(url);
  
  win2.on('closed', () => {
    urlWindow = null;
  });

  return win2;
};

ipcMain.handle('get-url-body-text-hidden', async (event, url) => {
  return await extractTextFromUrlWindowSilently(url);
});

//extract text from hidden window then close
const extractTextFromUrlWindowSilently = (url) => {
  return new Promise((resolve, reject) => {
    const child = createUrlWindow(url, { hidden: true });

    child.webContents.once('did-finish-load', async () => {
      try {
        const text = await child.webContents.executeJavaScript('window.childWindow.getUrlBodyText()');
        child.close();
        resolve(text);
      } catch (err) {
        child.close();
        reject(err);
      }
    });

    child.on('unresponsive', () => {
      child.close();
      reject(new Error('Child window became unresponsive.'));
    });
  });
};

// Listen for the renderer process to request opening second window
ipcMain.on('open-url-window', (event, url) => {
  if (!urlWindow) {
    createUrlWindow(url);
  } else {
    urlWindow.close();
    urlWindow = createUrlWindow(url);
  }
});

app.on('window-all-closed', async () => {
  await stopNeo4jServer();
  if (process.platform !== 'darwin') app.quit()
});

app.on('before-quit', async (event) => {
  event.preventDefault(); // Prevent default quitting behavior  
  await stopNeo4jServer();
  app.exit(0);
});

//////////////////////////// Express Server for API Access Section ////////////////////////////

//utilize express to create a server for API communication so that the main window can maintain CORS security
async function startAPIFetcher() {
  const expressApp = express();
  expressApp.use(cors());
  expressApp.use(express.json());

  expressApp.all('/proxy', async (req, res) => {
    const targetUrl = req.query.url;
    
    if (!targetUrl) {
      return res.status(400).send('A valid URL is required');
    }

    if (!req.body) {
      return res.status(400).send('Internal express requests must include an APIEndpoint object in the request body.');
    }

    try {
      var storedFingerprint;

      //get the pinned certificate hash for the domain
      const certAuthHostname = req.body.certAuthHostname
      if(certAuthHostname) {
        //check OS key vault for the stored certificate hash
        storedFingerprint = await keytar.getPassword('OpenFinALCert', certAuthHostname);

        if (!storedFingerprint) {
          // Retrieve and store the certificate if not retrieved by keytar
          try {
            storedFingerprint = await getCertificateFingerprint(req.body);

            if (storedFingerprint) {
              await keytar.setPassword('OpenFinALCert', certAuthHostname, storedFingerprint);
            } else {
              return res.status(500).send('Could not retrieve certificate fingerprint'); // Or handle this differently
            }
          } catch (fingerprintError) {
            return res.status(500).send(`Error retrieving certificate fingerprint: ${fingerprintError}` ); // Or handle this differently
          }
        }
      }
      
      var response;

      if(req.body.method === "POST") {
        const postHeaders = {headers: req.body.headers};

        if(!req.body.headers && !req.body.body) {
          response = await axios.post(targetUrl);
        } 
        else if(req.body.headers && !req.body.body) {
          response = await axios.post(targetUrl, null, postHeaders);
        }
        else if(req.body.body && !req.body.headers) {
          response = await axios.post(targetUrl, req.body.body)
        } else {
          const postHeaders = {headers: req.body.headers};
          response = await axios.post(targetUrl, req.body.body, postHeaders);
        }
      } else {
        const baseURL = req.body.protocol + "://" + req.body.hostname;
        var url = new URL(baseURL);
        url.protocol = req.body.protocol;
        url.hostname = req.body.hostname;
        url.port = req.body.port ? req.body.port : 443;
        url.pathname = req.body.pathname;
        url.search = req.body.search ? req.body.search : "";
        
        if(!req.body.headers) {
          response = await axios.get(url.href);
        } else {
          const otherHeaders = {headers: req.body.headers};
          response = await axios.get(url.href, otherHeaders);
        }
      }
      
      var cert = response.request.socket?.getPeerCertificate();
      if (!cert) {
        res.status(403).json({
            error: {
              code: "FORBIDDEN",
              message: "Access to the requested resource is forbidden. Unable to retrieve the SSL/TLS certificate for validation.",
            }
        });
        return;
      }

      var fingerprint = crypto.createHash('sha256').update(cert.raw).digest('hex');
      if (storedFingerprint !== fingerprint) {
        res.status(403).json({
            error: {
              code: "FORBIDDEN",
              message: "Access to the requested resource is forbidden. The retrieve SSL/TLS certificate does not appear to be valid.",
            }
        });
        return;
      }

      return res.json(response.data);
    } catch (error) {
      if (error.isAxiosError && error.response) {
        return res.status(error.response.status).json(error.response.data);
      } else {
        res.status(500).json({message: 'Unknown internal proxy server error'});
      }
    }
  });

  expressApp.listen(3001);
}

//get certificate fingerprint to ensure secure access
async function getCertificateFingerprint(request) {
  try {
    const options = {
      host: request.certAuthHostname,
      port: 443,
      servername: request.certAuthHostname
    };

    return new Promise((resolve, reject) => {
      const socket = tls.connect(options, () => {});

      socket.on('secureConnect', () => {
        const cert = socket.getPeerCertificate(true);

        if (!cert) {
          console.error(`No certificate found for ${request.hostname}`);
          resolve(null);
          return;
        }

        var fingerprint = crypto.createHash('sha256').update(cert.raw).digest('hex');
        socket.destroy();
        resolve(fingerprint);
      });

      socket.on('error', (err) => {
        console.error(`Error connecting to ${request.hostname}:`, err);
        reject(err);
      });
    });    
  } catch (error) {
    console.error(`Error getting certificate fingerprint for ${request.hostname}:`, error);
    return null;
  }
}

async function refreshCertificateFingerprint(hostname) {
  var request = {
    certAuthHostname: hostname,
    hostname: hostname
  };

  try { 
    const fingerprint = await getCertificateFingerprint(request);
    const storedFingerprint = await keytar.getPassword('OpenFinALCert', hostname);

    if(storedFingerprint !== fingerprint) {
      await keytar.setPassword('OpenFinALCert', hostname, fingerprint);
    }

    return true;
  } catch(error) {
    console.error(error);
    return false;
  }
}

ipcMain.handle('refresh-cert', async (event, hostname) => {
  return await refreshCertificateFingerprint(hostname);
});

//////////////////////////// Keytar Secret Storage Section ////////////////////////////

//keytar allows for the secure storage of API keys and other secrets
async function getSecret(key) {
  try {
    return await keytar.getPassword('OpenFinAL', key);
  } catch(error) {
    console.error(error);
    return null;
  }
}

async function setSecret(key, secret) {
  try {
    await keytar.setPassword('OpenFinAL', key, secret);
    return true;
  } catch(error) {
    console.error(error);
    return false;
  }
}

ipcMain.handle('get-secret', async (event, key) => {
  return await getSecret(key);
});

ipcMain.handle('set-secret', async (event, key, value) => {
  return await setSecret(key, value);
});

//////////////////////////// Transformers.js Section ////////////////////////////

const { pipeline, env } = require('@xenova/transformers');

env.allowLocalModels = false;
env.localModelPath = '/models'; // resolves to http://localhost:3000/models

let localModel = null;

async function getPipeline(model) {
  if (model !== localModel) {
    localModel = pipeline("text-generation", model);
  }

  return localModel;
}

ipcMain.handle('run-transformers', async (event, model, prompt, params) => {
  if (!model) {
    throw new Error('An model must be specified');
  }
  if (!prompt) {
    throw new Error('A prompt must be provided');
  }

  try {
    const pipe = await getPipeline(model);
    const output = await pipe(prompt, params);
    return output;
  } catch (err) {
    // Re-throw so renderer sees a rejected promise
    throw err;
  }
});


//////////////////////////// Yahoo Finance Section ////////////////////////////
async function yahooChart(ticker, options) {
 return await yf.chart(ticker, options);
}

async function yahooSearch(keyword, options) {
  return await yf.search(keyword, options);
}

async function yahooHistorical(ticker, options) {
  return await yf.historical(ticker, options);
}

ipcMain.handle('yahoo-chart', async (event, ticker, options) => {
  return await yahooChart(ticker, options);
});

ipcMain.handle('yahoo-search', async (event, keyword, options) => {
  return await yahooSearch(keyword, options);
});

ipcMain.handle('yahoo-historical', async (event, ticker, options) => {
  return await yahooHistorical(ticker, options);
});

//////////////////////////// Software Configuration Section ////////////////////////////

//use fs to save config files user userData folder
const configFileName = 'default.config.json';
const configPath = path.join(app.getPath('userData'), configFileName);

function getAppPath() {
  return app.getAppPath('userData');
}

function getAssetPath() {
  const isDev = !app.isPackaged;
  const assetPath = isDev
    ? path.join(__dirname, '../renderer/Asset/Slideshows')
    : path.join(process.resourcesPath, 'Asset/Slideshows');

  return assetPath;
}

ipcMain.handle('get-user-path', (event) => {
  return getAppPath();
});

ipcMain.handle('get-asset-path', (event) => {
  return getAssetPath();
});


function saveConfig(config) {
  try {
    fs.openSync(configPath, 'w');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 4));
    return true; // Indicate success
  } catch (err) {
    console.error('Error saving config:', err);
    return false; // Indicate failure
  }
}

function hasConfig() {
  try {
    if(fs.existsSync(configPath)) {
      return true;
    } else {
      throw new Error("The config file does not exist");
    }
  } catch(error) { 
    //console.error(error);
    return false;
  }
}

function loadConfig() {
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading config:', err);
    return false; 
  }
}

ipcMain.handle('has-config', (event) => {
  return hasConfig();
});

ipcMain.handle('save-config', (event, config) => {
  return saveConfig(config);
});

ipcMain.handle('load-config', (event) => {
  return loadConfig();
});

//////////////////////////// Puppeteer for Scraping/Automatin Section ////////////////////////////

//puppeteer allows for automated visiting of websites to extract text
ipcMain.handle('puppeteer:get-page-text', async (event, url) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle2' });
    
    if(url.includes("zacks.com")) {
      await page.waitForSelector('.show_article');
      await page.click('.show_article');
    }
    
    const text = await page.evaluate(() => document.body.innerText);
    await browser.close();
    return text;
  } catch (err) {
    await browser.close();
    console.log(err);
  }
});

//////////////////////////// File Management Section ////////////////////////////

// UTF-8 read
async function readFromFile(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

ipcMain.handle('read-file', async (event, file) => {
  const data = await readFromFile(file);
  return data;
});

// Binary-safe read (no encoding argument)
async function readFromFileBinary(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, (err, data) => {   //returns a Buffer
      if (err) {
        reject(err);
      } else {
        resolve(data); // Buffer
      }
    });
  });
}

ipcMain.handle('read-binary', async (_event, file) => {
  const data = await readFromFileBinary(file); // Buffer
  return data; 
});

//////////////////////////// Database Section ////////////////////////////

const dbFileName = 'OpenFinAL.sqlite';
const dbPath = path.join(app.getPath('userData'), dbFileName);

let db;
let betterDb;

const sqliteExists = async () => {
  try {
    await fs.access(dbPath);
    return true;
  } catch(error) {
    console.log(error);
    return false;
  }
};

const getDB = async () => {
  try {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        // Database connection error
      }
    });

    // Also initialize better-sqlite3 for migrations
    //betterDb = new Database(dbPath);
    
    // Run migrations
    //await runMigrations();

    return true;
  } catch (error) {
    return false;
  }
}

const initDatabase = async (schema) => {
  try {
    if(!db) {
      getDB();
    }

    //const schema = await fs.promises.readFile(path.join(app.getAppPath(), 'Asset/DB/schema.sql'), 'utf-8');
    db.exec(schema);
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

const selectFromDatabase = (query, dataArray) => {
  if(!db) {
    getDB();
  }

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

const sqliteQuery = async (query, dataArray) => {
  if(!db) {
    getDB();
  }

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

const sqliteGet = async (query, dataArray) => {
  if(!db) {
    getDB();
  }

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

const sqliteRun = async (query, dataArray) => {
  if(!db) {
    getDB();
  }

  return new Promise((resolve, reject) => {
    try {
      //execute the query
      db.run(query, dataArray, function (err, data) {
        if (err) {
          reject(err);
          return false;
        }

        //when inserting, return the last insert id
        if (query.toUpperCase().startsWith("INSERT")) {
          resolve({ ok: true, lastID: this.lastID }); 
        } else {
          resolve(true);
        }
      });
    } catch (err) {
      reject(err);
    } 
  });
};

ipcMain.handle('sqlite-exists', async (event) => {
  const exists = await sqliteExists();
  return exists;
});

ipcMain.handle('sqlite-init', async (event, schema) => {
  const result = await initDatabase(schema);
  return result;
});

ipcMain.handle('select-data', async (event, args) => {
  const data = await selectFromDatabase(args["query"], args["inputData"]);
  return data;
});

ipcMain.handle('sqlite-query', async (event, args) => {
  const data = await sqliteQuery(args["query"], args["parameters"]);
  return data;
});

ipcMain.handle('sqlite-get', async (event, args) => {
  const data = await sqliteGet(args["query"], args["parameters"]);
  return data;
});

ipcMain.handle('sqlite-insert', async (event, args) => {
  const data = await sqliteRun(args["query"], args["parameters"]);
  return data;
});

ipcMain.handle('sqlite-update', async (event, args) => {
  console.log("Executing query:", args["query"], "with parameters:", args["parameters"]);
  const data = await sqliteRun(args["query"], args["parameters"]);
  return data;
});

ipcMain.handle('sqlite-delete', async (event, args) => {
  const data = await sqliteRun(args["query"], args["parameters"]);
  return data;
});

//////////////////////////// Neo4j Section ////////////////////////////

let neo4jProcess = null;
let neo4jDriver = null;
let neo4jReadyPromise = null;
let NEO4J_PASS = "password";

let neo4jStdoutBuffer = "";
const MAX_BUF = 200_000; // keep last ~200KB

function getNeo4jHome() {
  return path.join(app.getPath('userData'), 'neo4j');
}

function getJavaHome() {
  return path.join(app.getPath('userData'), 'java');
}

function getNeo4jBundle() {
  let base;
  let fullPath; 
  console.log("app is packaged ", app.getAppPath());
  if(app.isPackaged) {
    base = process.resourcesPath;
  } else {
    base = path.join(app.getAppPath(), "resources");
  }

  if(os.platform() === 'win32') {
    fullPath = path.join(base, "neo4j-win");
    return fullPath;
  }
}

function getNeo4jAdminExecutable() {
  const neo4jHome = getNeo4jHome();
  // Windows distributions ship .bat under bin
  if (os.platform() === "win32") {
    return path.join(neo4jHome, "bin", "neo4j-admin.bat");
  }
  return path.join(neo4jHome, "bin", "neo4j-admin");
}

function getJavaBundle() {
  let base;
  let fullPath; 
  console.log("app is packaged ", app.getAppPath());
  if(app.isPackaged) {
    base = process.resourcesPath;
  } else {
    base = path.join(app.getAppPath(), "resources");
  }

  if(os.platform() === 'win32') {
    fullPath = path.join(base, "jre-win");
    return fullPath;
  }
}

function getNeo4jExecutable() {
  const binPath = path.join(getNeo4jHome(), 'bin');

  if(os.platform() === 'win32') {
    return path.join(binPath, 'neo4j.bat');
  }
  return path.join(binPath, 'neo4j');
}

function verifyNeo4jInstall() {
  if(!fs.existsSync(getNeo4jHome())) {
    console.log("the directory doesn't exist ", getNeo4jHome(), getNeo4jBundle());
    fs.cpSync(getNeo4jBundle(), getNeo4jHome(), { recursive: true });
    console.log("copied bundle")
  }
}

function verifyJavaInstall() {
  if(!fs.existsSync(getJavaHome())) {
    console.log("the directory doesn't exist ", getJavaHome(), getJavaBundle());
    fs.cpSync(getJavaBundle(), getJavaHome(), { recursive: true });
    console.log("copied bundle")
  }
}

async function setInitialNeo4jPassword() {
  const neo4jAdminBat = getNeo4jAdminExecutable();
  if (!fs.existsSync(neo4jAdminBat)) {
    throw new Error(`neo4j-admin not found at: ${neo4jAdminBat}`);
  }

  const javaHome = getJavaHome(); // must be Java 21 now

  return new Promise((resolve, reject) => {
    const cmd = "cmd.exe";
    const args = ["/c", neo4jAdminBat, "dbms", "set-initial-password", NEO4J_PASS];

    execFile(
      cmd,
      args,
      {
        windowsHide: true,
        env: {
          ...process.env,
          JAVA_HOME: javaHome,
          PATH: `${path.join(javaHome, "bin")};${process.env.PATH}`,
        },
      },
      (err, stdout, stderr) => {
        if (stdout?.trim()) console.log("[neo4j-admin stdout]", stdout.trim());
        if (stderr?.trim()) console.warn("[neo4j-admin stderr]", stderr.trim());
        if (err) return reject(err);
        resolve();
      }
    );
  });
}

function resetNeo4jAuthIfDev() {
  if (app.isPackaged) return; // only do this in dev

  const databasesPath = path.join(getNeo4jHome(), "data", "databases", "system");
  if (fs.existsSync(databasesPath)) {
    console.log("Dev reset: deleting Neo4j auth file:", databasesPath);
    fs.rmSync(databasesPath, { recursive: true, force: true });
  }

  const transactionPath = path.join(getNeo4jHome(), "data", "transactions", "system");
  if (fs.existsSync(transactionPath)) {
    console.log("Dev reset: deleting Neo4j auth file:", transactionPath);
    fs.rmSync(transactionPath, { recursive: true, force: true });
  }
}

async function startNeo4jServer() {
  if (neo4jProcess) {
    console.log("Neo4j already running, PID:", neo4jProcess.pid);
    return;
  }

  verifyNeo4jInstall();
  verifyJavaInstall();
  resetNeo4jAuthIfDev()
  await setInitialNeo4jPassword();
  //resetNeo4jAuthIfDev();

  const neo4jHome = getNeo4jHome();
  const neo4jBin = getNeo4jExecutable();

  const javaHome = getJavaHome();

  neo4jProcess = spawn(
    neo4jBin, 
    ['console'], 
    { 
      cwd: neo4jHome,
      shell: true, 
      env: {
        ...process.env,
        JAVA_HOME: javaHome,
        PATH: `${path.join(javaHome, "bin")};${process.env.PATH}`,
        NEO4J_AUTH: `neo4j/${NEO4J_PASS}`,
      },
      stdio: "pipe", 
    });

  neo4jProcess.stdout.on("data", (data) => {
    const text = data.toString("utf8");
    neo4jStdoutBuffer += text;
    if (neo4jStdoutBuffer.length > MAX_BUF) {
      neo4jStdoutBuffer = neo4jStdoutBuffer.slice(-MAX_BUF);
    }
    console.log(`Neo4j: ${text}`);
  });

  neo4jProcess.stderr.on('data', (data) => {
    console.error(`Neo4j ERR: ${data}`);
  });

  neo4jProcess.on("exit", (code) => {
    console.log("Neo4j exited with code", code);
    neo4jProcess = null;
  });
}

async function stopNeo4jServer() {
  if (!neo4jProcess) return;

  const pid = neo4jProcess.pid;
  console.log("Stopping Neo4j process tree, PID:", pid);

  await new Promise((resolve) => {
    exec(`taskkill /PID ${pid} /T /F`, (err) => {
      if (err) {
        console.warn("taskkill error (may already be stopped):", err.message);
      }
      resolve();
    });
  });

  neo4jProcess = null;
  neo4jReadyPromise = null;

  try {
    await neo4jDriver?.close();
  } catch {}
  neo4jDriver = null;

  console.log("Neo4j fully stopped");
}

function setNeo4jDriver() {
  if(!neo4jProcess) {
    return null;
  }

  neo4jDriver = neo4j.driver(
    'bolt://127.0.0.1:7687', 
    neo4j.auth.basic('neo4j', NEO4J_PASS), {
      encrypted: "ENCRYPTION_OFF",
      disableLosslessIntegers: true,
  });
}

const net = require("net");

async function waitForTcpPort(host, port, timeoutMs = 30000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const tick = () => {
      const socket = net.createConnection({ host, port });

      socket.once("connect", () => {
        socket.destroy();
        resolve(true);
      });

      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - start > timeoutMs) {
          reject(new Error(`Timeout waiting for ${host}:${port}`));
        } else {
          setTimeout(tick, 500);
        }
      });
    };

    tick();
  });
}

function readLastBytes(filePath, maxBytes = 64 * 1024) {
  const stats = fs.statSync(filePath);
  const size = stats.size;
  const start = Math.max(0, size - maxBytes);

  const fd = fs.openSync(filePath, "r");
  const buffer = Buffer.alloc(size - start);
  fs.readSync(fd, buffer, 0, buffer.length, start);
  fs.closeSync(fd);

  return buffer.toString("utf8");
}

async function waitForNeo4jLogLine(regex, timeoutMs = 30000) {
  const logPath = path.join(getNeo4jHome(), "logs", "neo4j.log");

  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    try {
      if (fs.existsSync(logPath)) {
        const tail = readLastBytes(logPath, 64 * 1024);
        if (regex.test(tail)) {
          return true;
        }
      }
    } catch {
      // file may not exist yet
    }

    await new Promise(r => setTimeout(r, 500));
  }

  throw new Error("Timed out waiting for Neo4j Started.");
}

async function checkNeo4jConnection() {
  if (!neo4jDriver) {
    setNeo4jDriver();
  }

  try {
    console.log("Checking Neo4j connection...");
    await waitForTcpPort("127.0.0.1", 7687);
    console.log("Neo4j is listening on port 7687");
    await waitForNeo4jLogLine(/\bINFO\s+Started\.\s*$/m);
    console.log("Neo4j started successfully");
    await neo4jDriver.verifyConnectivity();
    console.log("Verified Neo4j is connected");
    return true;
  } catch (e) {
    return false;
  }
}

async function waitForNeo4jReady(timeoutMs = 30000) {
  if (!neo4jDriver) {
    setNeo4jDriver();
  }

  const start = Date.now();
  let lastErr = null;

  while (Date.now() - start < timeoutMs) {
    try {
      await neo4jDriver.verifyConnectivity();
      return;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  throw lastErr || new Error("Neo4j did not become ready before timeout.");
}

function openNeo4jSession(type) {
  if(!neo4jDriver) {
    setNeo4jDriver();
  }

  let neo4jSession;

  if(type==="write") {
    neo4jSession = neo4jDriver.session({
      defaultAccessMode: neo4j.session.WRITE
    });
  } else {
    neo4jSession = neo4jDriver.session({
      defaultAccessMode: neo4j.session.READ
    });
  }

  return neo4jSession;
}

async function closeNeo4jSession(neo4jSession) {
  if(neo4jSession) {
    await neo4jSession.close();
  }
}

async function executeNeo4jQuery(mode, query, params) {
  if(!neo4jDriver) {
    setNeo4jDriver();
  }

  if (!neo4jReadyPromise) {
    neo4jReadyPromise = waitForNeo4jReady(30000);
  }
  await neo4jReadyPromise;
  
  let neo4jSession = openNeo4jSession(mode); 

  let result;
  if(params) {
    result = await neo4jSession.run(query, params);
    return result;
  } else {
    result = await neo4jSession.run(query);
  }

  await closeNeo4jSession(neo4jSession);
  
  return result;
}

ipcMain.handle('neo4j-start', async (event, args) => {
  try {
    await startNeo4jServer();
    return true;
  } catch (error) {
    console.error("Error starting Neo4j server:", error);
    return false;
  }
});

ipcMain.handle('neo4j-stop', async (event, args) => {
  try {
    await stopNeo4jServer();
    return true;
  } catch (error) {
    console.error("Error stopping Neo4j server:", error);
    return false;
  }
});

ipcMain.handle('neo4j-restart', async (event, args) => {
  try {
    await stopNeo4jServer();
    startNeo4jServer();
    return true;
  } catch (error) {
    console.error("Error stopping Neo4j server:", error);
    return false;
  }
});

ipcMain.handle('neo4j-is-connected', async(event, args) => {
  const results = await checkNeo4jConnection();
  return results;
});

ipcMain.handle('neo4j-execute', async(event, args) => {
  const results = await executeNeo4jQuery(args["mode"], args["query"], args["params"]);
  return results;
});





