// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');
const fs = require("fs");
const ipcMain = require('electron').ipcMain;

const sqlite3 = require('sqlite3').verbose();
const puppeteer = require('puppeteer');
const keytar = require('keytar');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const https = require("https");
const crypto = require("crypto");

//////////////////////////// Core Electron Section ////////////////////////////

let win;           // main window
let urlWindow;     // url window
 
//change userData folder name from open-fin-al to OpenFinal and make folder
app.setPath('userData', path.join(app.getPath('appData'), 'OpenFinAL'));
if (!fs.existsSync(app.getPath('userData'))) {
  fs.mkdirSync(app.getPath('userData'), { recursive: true });
}

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
  //win.setMenu(null); // this doesn't allow opening developer tools
  win.maximize();
  win.show();

  //stop the main window from opening links to external sites
  win.webContents.setWindowOpenHandler(() => { return { action: 'deny' }; });

  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY); 
  //win.loadURL(path.join(app.getAppPath(), 'src/index.html'));
};

//utilize express to create a server for API communication so that the main window can maintain CORS security
async function startAPIFetcher() {
  const expressApp = express();
  expressApp.use(cors());
  expressApp.use(express.json());

  expressApp.all('/proxy', async (req, res) => {
    const targetUrl = req.query.url || req.body.url;
    
    console.log('THE TARGET URL IS: ', targetUrl);
    if (!targetUrl) {
      console.log("A url was not provided with the request.");
      return res.status(400).send('Target URL is required');
    }
    
    try {
      const urlObject = new URL(targetUrl);
      const hostname = urlObject.hostname;
      const companyName = 'OpenFinAL'; // Replace with your actual company name
      const companyEmail = 'jeffrey.d.wall@gmail.com'; // Replace with your actual email

      //search for stored certificate in keytar
      var storedFingerprint = await keytar.getPassword('OpenFinALCert', hostname);
      console.log(storedFingerprint);
      if (!storedFingerprint) {
        // Retrieve and store the certificate if it's not in Keytar
        try {
          console.log(`Trying to retrieve the certificate from ${hostname}`);
          storedFingerprint = await getCertificateFingerprint(hostname, companyName, companyEmail);
          console.log(storedFingerprint);
          if (storedFingerprint) {
            await keytar.setPassword('OpenFinALCert', hostname, storedFingerprint);
            console.log(`Stored new certificate fingerprint for ${hostname}`);
          } else {
            console.log("Failed to retrieve the certificate");
            return res.status(500).send('Could not retrieve certificate fingerprint'); // Or handle this differently
          }
        } catch (fingerprintError) {
          console.error('Error retrieving certificate fingerprint:', fingerprintError);
          return res.status(500).send('Error retrieving certificate fingerprint'); // Or handle this differently
        }
      }

      const response = await new Promise((resolve, reject) => {
        req.headers['User-Agent'] = `${companyName} ${companyEmail}`;

        const options = {
          protocol: "https:",
          method: req.method,
          hostname: hostname,
          port: 443,
          path: urlObject.pathname + urlObject.search,
          headers: req.headers,
          rejectUnauthorized: false,
        };

        const reqHttps = https.request(options, (resHttps) => {
          let responseData = '';

          resHttps.setEncoding('utf8');

          resHttps.on('data', (chunk) => {
            responseData += chunk;
          });

          resHttps.socket.on('secureConnect', () => {
            const cert = resHttps.socket.getPeerCertificate();
            if (!cert) {
              reject(new Error(`No certificate found for ${hostname}`));
              return;
            }

            const fingerprint = crypto.createHash('sha256').update(cert.raw).digest('hex');

            if (storedFingerprint && fingerprint !== storedFingerprint) {
              reject(new Error('Certificate validation failed'));
              return;
            }

            resHttps.on('end', () => {
              try {
                const parsedData = JSON.parse(responseData);
                resolve({ data: parsedData, headers: resHttps.headers });
              } catch (parseError) {
                resolve({ data: responseData, headers: resHttps.headers });
              }
            });
          });

          resHttps.on('error', reject);
        });

        reqHttps.on('error', reject);
        if (req.body) {
          reqHttps.write(JSON.stringify(req.body));
        }

        reqHttps.end();
      });

      console.log("THIS IS THE RESPONSE DATA");
      console.log(response.data);
      res.json(response.data);

    } catch (error) {
      console.error('Proxy error:', error);
      res.status(500).json({message: 'Proxy error'});
    }
  });

  expressApp.listen(3001, () => {
    console.log('Proxy server listening on port 3001');
  });
}

async function getCertificateFingerprint(hostname, companyName, companyEmail) {
  try {
    var response = await axios.get(`https://${hostname}`, {
      headers: {
        'User-Agent': `${companyName} ${companyEmail}`,
      },
    });

    var cert = response.request.socket.getPeerCertificate();
    if (!cert) {
      console.error(`No certificate found for ${hostname}`);
      return null;
    }

    var fingerprint = crypto.createHash('sha256').update(cert.raw).digest('hex');
    return fingerprint;
  } catch (error) {
    console.error(`Error getting certificate fingerprint for ${hostname}:`, error);
    return null;
  }
}

//keytar allows for the secure storage of API keys and other secrets
async function getSecret(key) {
  try {
    return await keytar.getPassword('OpenFinAL', key);
  } catch(error) {
    window.console.error(error);
    return null;
  }
}

async function setSecret(key, secret) {
  try {
    await keytar.setPassword('OpenFinAL', key, secret);
    return true;
  } catch(error) {
    window.console.error(error);
    return false;
  }
}

ipcMain.handle('get-secret', async (event, key) => {
  return await getSecret(key);
});

ipcMain.handle('set-secret', async (event, key, value) => {
  return await setSecret(key, value);
});

//use fs to save config files user userData folder
const configFileName = 'default.config.json';
const configPath = path.join(app.getPath('userData'), configFileName);

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
    console.error(error);
    return false;
  }
}

function loadConfig() {
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error loading config:', err);
    return false; // Return default config
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

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          `default-src 'self'; 
          script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net; 
          style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.gstatic.com https://cdnjs.cloudflare.com; 
          img-src 'self' data: https://*.gstatic.com; 
          font-src 'self' https://fonts.gstatic.com; 
          connect-src 'self' http://localhost:3001;`
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
});

//////////////////////////// Database Section ////////////////////////////
const userDataPath = app.getPath('userData');
console.log(userDataPath);
const dbFileName = 'OpenFinal.sqlite';
const dbPath = path.join(userDataPath, dbFileName);

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
    
    const schema = await fs.promises.readFile(path.join(app.getAppPath(), 'src/Asset/DB/schema.sql'), 'utf-8');
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
