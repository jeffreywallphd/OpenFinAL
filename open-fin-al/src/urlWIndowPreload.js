const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('childWindow', {
    getUrlBodyText: () => document.body.innerText
});