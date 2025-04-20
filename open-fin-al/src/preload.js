// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');
  
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: require('electron').ipcRenderer,
});

/*contextBridge.exposeInMainWorld('fs', {
    fs: require('fs')
});*/

contextBridge.exposeInMainWorld('file', {
    read: (file) => ipcRenderer.invoke('read-file', file),
});

contextBridge.exposeInMainWorld('exApi', {
    fetch: async (url, params={}) => {
        try {
            var urlString = `http://localhost:3001/proxy?url=${encodeURIComponent(url)}`;
                        
            var response;
            if(!params || Object.keys(params).length === 0) {
                response = await fetch(urlString);
            } else {
                response = await fetch(urlString, params);
            }

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
    SQLiteInsert: (object) => ipcRenderer.invoke('sqlite-insert', object)
});

contextBridge.exposeInMainWorld('yahoo', {
    finance: require('yahoo-finance2').default
});

contextBridge.exposeInMainWorld('yahooFinance', {
    chart: (ticker, options) => ipcRenderer.invoke('yahoo-chart', ticker, options),
    search: async (keyword, options) => ipcRenderer.invoke('yahoo-search', keyword, options),
    historical: async (ticker, options) => ipcRenderer.invoke('yahoo-historical', ticker, options)
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


