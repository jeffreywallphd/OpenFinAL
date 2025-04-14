const path = require('path');
const { contextBridge, ipcRenderer } = require('electron')
const { promises: fsPromises } = require('fs');
const fs = require('fs');
  
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: require('electron').ipcRenderer,
});

contextBridge.exposeInMainWorld('fs', {
    fs: require('fs'),
});

contextBridge.exposeInMainWorld('yahoo', {
    finance: require('yahoo-finance2').default
});

contextBridge.exposeInMainWorld('urlWindow', {
    openUrlWindow: (url) => ipcRenderer.send('open-url-window', url)
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

contextBridge.exposeInMainWorld('chatbot', {
    openai: require('openai')
});
