// import { contextBridge, ipcRenderer } from 'electron';

// // Expose ipcRenderer to the renderer process
// contextBridge.exposeInMainWorld('ipcRenderer', {
//   sendMessage: (message: any) => ipcRenderer.send('message', message),
//   on: (channel: any, callback: any) => {
//     ipcRenderer.on(channel, (_, data) => callback(data));
//   }
// });

// // Optional: Function to minimize, maximize, and close the window
// contextBridge.exposeInMainWorld('windowControls', {
//   minimize: () => ipcRenderer.send('minimize'),
//   maximize: () => ipcRenderer.send('maximize'),
//   close: () => ipcRenderer.send('close')
// });
