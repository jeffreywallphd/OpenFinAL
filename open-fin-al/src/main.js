// No Warranty
// This software is provided "as is" without any warranty of any kind, express or implied. This includes, but is not limited to, the warranties of merchantability, fitness for a particular purpose, and non-infringement.
//
// Disclaimer of Liability
// The authors of this software disclaim all liability for any damages, including incidental, consequential, special, or indirect damages, arising from the use or inability to use this software.

const { app, BrowserWindow, shell, session } = require('electron');
const path = require('path');
const fs = require("fs");

const handleSquirrelEvent = () => {
  if (process.argv.length === 1) return false;

  const squirrelEvent = process.argv[1];

  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Create shortcuts, etc., if needed
      app.quit();
      return true;

    case '--squirrel-uninstall':
      // 💥 Custom cleanup logic
      const appDataPath = path.join(app.getPath('appData'), 'OpenFinAL');
      fs.removeSync(appDataPath);

      app.quit();
      return true;

    case '--squirrel-obsolete':
      app.quit();
      return true;
  }

  return false;
};

handleSquirrelEvent();

const os = require('os');
const ipcMain = require('electron').ipcMain;
const sqlite3 = require('sqlite3').verbose();
const puppeteer = require('puppeteer');
const keytar = require('keytar');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require("crypto");
const yf = require("yahoo-finance2").default;

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
          img-src 'self' data: https://*.gstatic.com https://ml-eu.globenewswire.com https://mma.prnewswire.com https://cdn.benzinga.com https://www.benzinga.com https://editorial-assets.benzinga.com https://contributor-assets.benzinga.com https://staticx-tuner.zacks.com https://media.ycharts.com https://g.foolcdn.com https://ml.globenewswire.com https://images.cointelegraph.com https://s3.cointelegraph.com https://cdn.i-scmp.com https://smallfarmtoday.com/ https://thearorareport.com; 
          font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com; 
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
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

    //const urlObject = new URL(targetUrl);
    
    //const headers = req.headers ? req.headers : null;
    //const body = req.body ? req.body : null;

    //to override default method and user-agent selected by browser, pass method and agent as url query params
    /*const method = req.body ? req.body.method : "GET";
    const userAgent = req.body ? req.body.headers["User-Agent"] : null
    const headers = req.body ? req.body.headers : null;

    const requestDetails = {};
    const certificateRequestDetails = {};

    //control which headers pass through to the express server.
    if(headers) {
      requestDetails.headers = {};

      if(userAgent) {
        requestDetails.headers["User-Agent"] = userAgent;
        certificateRequestDetails["User-Agent"] = userAgent;
      }
      else if(headers["user-agent"]) {
        requestDetails.headers["User-Agent"] = headers["user-agent"];
        certificateRequestDetails["User-Agent"] = headers["user-agent"];
      }

      if(headers && headers["authorization"]) {
        requestDetails.headers["Authorization"] = headers["Authorization"];
        certificateRequestDetails["Authorization"] = headers["Authorization"];
      }

      if(headers && headers["content-type"]) {
        requestDetails.headers["Content-Type"] = headers["content-type"];
        certificateRequestDetails["Content-Type"] = headers["content-type"];
      }
    }
    
    if(body) {
      delete body.endpointMethod;
      requestDetails.body = body;
    }
    */ 

    try {
      //const hostname = urlObject.hostname;
      const certAuthHostname = req.body ? req.body.certAuthHostname : null
      if(certAuthHostname) {
        //check OS key vault for the stored certificate hash
        var storedFingerprint = await keytar.getPassword('OpenFinALCert', certAuthHostname);

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
        if(!req.body.headers && !req.body.body) {
          response = await axios.post(targetUrl);
        } 
        else if(req.body.headers && !req.body.body) {
          const postHeaders = {headers: req.body.headers};
          response = await axios.post(targetUrl, null, postHeaders);
        }
        else if(req.body.body && !req.body.headers) {
          response = await axios.post(targetUrl, request.body.body)
        } else {
          response = await axios.post(targetUrl, request.body.body, request.body.headers);
        }
      } else {
        if(!req.body.headers) {
          response = await axios.get(targetUrl);
        } else {
          const otherHeaders = {headers: req.body.headers};
          response = await axios.get(targetUrl, otherHeaders);
        }
      }

      //if(req.body.method === "GET") {
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
      //}

      return res.json(response.data);
    } catch (error) {
      res.status(500).json({message: 'Proxy error'});
    }
  });

  expressApp.listen(3001, () => {
    console.log('Proxy server listening on port 3001');
  });
}

//get certificate fingerprint to ensure secure access
async function getCertificateFingerprint(request) {
  try {
    var response = null;
    
    try {
      if(request.headers) {
          response = await axios.get(`https://${request.certAuthHostname}`, {headers: request.headers});
      } else {
          response = await axios.get(`https://${certAuthHostname}`);
      }
    } catch(e) {
      console.log(e);
    }

    var cert = response.request.socket?.getPeerCertificate();
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
/*async function getCertificateFingerprint(hostname, method, certificateRequestDetails) {
  try {
    var response = null;
    
    try {
      if(method === "POST") {
        if(Object.keys(certificateRequestDetails).length > 0) {
          const postHeaders = {headers: certificateRequestDetails};
          response = await axios.post(`https://${hostname}`, null, postHeaders);
        } else {
          response = await axios.post(`https://${hostname}`);
        }
      } else {
        if(Object.keys(certificateRequestDetails).length > 0) {
            response = await axios.get(`https://${hostname}`, certificateRequestDetails);
        } else {
            response = await axios.get(`https://${hostname}`);
        }
      }
    } catch(e) {
      console.log(e);
    }

    var cert = response.request.socket?.getPeerCertificate();
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
}*/

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


//////////////////////////// Database Section ////////////////////////////

const dbFileName = 'OpenFinAL.sqlite';
const dbPath = path.join(app.getPath('userData'), dbFileName);

let db;

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
        console.error('Could not connect to database', err);
      } else {
        console.log('Connected to database');
      }
    });

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
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
      db.run(query, dataArray, (err, data) => {
        if (err) {
          reject(err);
          return false;
        }

        resolve(true);
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
  const data = await sqliteRun(args["query"], args["parameters"]);
  return data;
});

ipcMain.handle('sqlite-delete', async (event, args) => {
  const data = await sqliteRun(args["query"], args["parameters"]);
  return data;
});

