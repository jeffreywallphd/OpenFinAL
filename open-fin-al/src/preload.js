// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

console.log("THIS IS THE PRELOAD SCRIPT WITH ALL OF THE CONTEXT BRIDGES");

const path = require('path');
const { contextBridge, ipcRenderer } = require('electron');
const { promises: fsPromises } = require('fs');
const fs = require('fs');
const { get } = require('http');
  
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: require('electron').ipcRenderer,
});

contextBridge.exposeInMainWorld('fs', {
    fs: require('fs')
});

contextBridge.exposeInMainWorld('exApi', {
    fetch: async (url, params={}) => {
        try {
            var urlString = `http://localhost:3001/proxy?url=${encodeURIComponent(url)}`;
            
            /*if(params["User-Agent"]) {
                urlString += `&userAgent=${encodeURIComponent(params["User-Agent"])}`;
            }
            
            if(params["method"]) {
                urlString += `&method=${encodeURIComponent(params["method"])}`;
            }

            if(params["headers"]) {
                urlString += `&headers=${encodeURIComponent(params["headers"])}`;
            }

            if(params["body"]) {
                urlString += `&body=${encodeURIComponent(params["body"])}`;
            }*/
            console.log("HELLLO1");
            var response;
            if(!params || Object.keys(params).length === 0) {
                response = await fetch(urlString);
            } else {
                console.log("THE PARAMS IN PRELOAD: ");
                console.log(params);
                response = await fetch(urlString, params);
            }
            console.log(response);
            console.log("HELLLO2");
            if (!response.ok) {
              throw new Error(`The request failed with status: ${response.status}`);
            }

            const data = await response.json();
            return data;
          } catch (error) {
            console.error('Fetch error: ', error);
            return {}; // Return a default value (empty object)
        }
    }
});

contextBridge.exposeInMainWorld('vault', {
    getSecret: (key) => ipcRenderer.invoke('get-secret', key),
    setSecret: (key, value) => ipcRenderer.invoke('set-secret', key, value)
});

contextBridge.exposeInMainWorld('config', {
    exists: () => ipcRenderer.invoke('has-config'),
    save: (config) => ipcRenderer.invoke('save-config', config),
    load: () => ipcRenderer.invoke('load-config'),
});

contextBridge.exposeInMainWorld('database', {
    SQLiteGet: (object) => ipcRenderer.invoke('sqlite-get', object),
    SQLiteQuery: (object) => ipcRenderer.invoke('sqlite-query', object),
    SQLiteSelectData: (object) => ipcRenderer.invoke('select-data', object),
    SQLiteSelect: (object) => ipcRenderer.invoke('sqlite-get', object),
    SQLiteDelete: (object) => ipcRenderer.invoke('sqlite-delete', object),
    SQLiteUpdate: (object) => ipcRenderer.invoke('sqlite-update', object),
    SQLiteInsert: (object) => ipcRenderer.invoke('sqlite-insert', object),
});

contextBridge.exposeInMainWorld('yahoo', {
    finance: require('yahoo-finance2').default
});

contextBridge.exposeInMainWorld('urlWindow', {
    openUrlWindow: (url) => ipcRenderer.send('open-url-window', url),
    getUrlBodyTextHidden: (url) => ipcRenderer.invoke('get-url-body-text-hidden', url)
});

contextBridge.exposeInMainWorld('puppetApi', {
    getPageText: (url) => ipcRenderer.invoke('puppeteer:get-page-text', url)
});

contextBridge.exposeInMainWorld('convert', {
    xmlToJson: require('xml2js')
});

// for databases that rely on require(), add them to this contextBridge
contextBridge.exposeInMainWorld('database', {
    sqlite: (database) => {
        try{
            const sqlite3 = require('sqlite3').verbose();
            const db = new sqlite3.Database(database);
            return db;
        } catch(error) {
            window.console.error(error);
        }
    }
});

