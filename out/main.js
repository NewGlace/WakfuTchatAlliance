import { app, BrowserWindow, ipcMain } from 'electron';
import { getWebSocket, startWebSocket } from './websocket.js';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { startIcp } from './ipcMain.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
export class Client {
    constructor() {
        this.i = 0;
        this.username = '';
        this.ws = getWebSocket();
        app.whenReady().then(async () => {
            this.win = new BrowserWindow({
                width: 300,
                height: 250,
                frame: false,
                fullscreenable: false,
                skipTaskbar: true,
                transparent: true,
                alwaysOnTop: true,
                resizable: true,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: true,
                    preload: path.join(__dirname, 'preload.js'),
                },
            });
            startWebSocket(this.win, this);
            this.ws = getWebSocket();
            this.win.setAlwaysOnTop(true, 'screen-saver');
            this.win.loadFile(join(__dirname, 'html', 'main.html'));
            this.win.webContents.openDevTools();
            ipcMain.on('fermer', () => {
                this.win.close();
            });
        });
        ipcMain.on('set-window-size', (event, { width, height }) => {
            if (this.win) {
                this.win.setSize(width, height);
                this.win.center();
            }
        });
        setInterval(() => {
            if (this.ws) {
                if (this.ws.readyState >= WebSocket.CLOSING) {
                    this.win.webContents.send('ping', { timestamp: 9999 });
                    // Faire un système de reconnexion
                }
                else if (this.ws.readyState >= WebSocket.OPEN)
                    this.ws.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
            }
        }, 5000);
    }
}
startIcp();
new Client();
