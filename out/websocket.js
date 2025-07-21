import { ipcMain, app } from 'electron';
import fs from 'fs';
import path from 'path';
import { ip, port } from "./data.json";
const tokenPath = path.join(app.getPath('userData'), 'token.json');
let ws;
function waitForSocketConnection(ws, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const interval = setInterval(() => {
            if (ws.readyState === WebSocket.OPEN) {
                clearInterval(interval);
                resolve();
            }
        }, 20);
        setTimeout(() => {
            clearInterval(interval);
            reject(new Error("WebSocket timeout"));
        }, timeout);
    });
}
export const startWebSocket = (win, client) => {
    if (ws) {
        return;
    }
    ws = new WebSocket(`ws://${ip}:${port}`);
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'sent_message') {
            win.webContents.send('ajouter-message', data);
        }
        if (data.type === "userConnections") {
            win.webContents.send('update-stats', JSON.parse(data.data));
        }
        if (data.type === "pong") {
            win.webContents.send('ping', data);
        }
    };
    ipcMain.handle('send-ws-message', async (event, msg) => {
        return new Promise(async (resolve, reject) => {
            if (!ws || ws.readyState !== WebSocket.OPEN) {
                await waitForSocketConnection(ws, 100);
            }
            const onMessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === "create_account" || data.type === "login") {
                        if (data.code === "success") {
                            const token = data.token;
                            fs.writeFileSync(tokenPath, JSON.stringify({ token }), 'utf-8');
                        }
                    }
                    if (data.type === "create_account" || data.type === "login" || data.type === "auth") {
                        if (data.code === "success") {
                            const dataAccount = JSON.parse((data).data);
                            client.username = dataAccount.username;
                        }
                    }
                    ws.removeEventListener('message', onMessage);
                    if (data.type !== 'sent_message' && data.type !== "userConnections" && data.type !== "pong") {
                        resolve(data);
                    }
                }
                catch (e) {
                    ws.removeEventListener('message', onMessage);
                    reject(e);
                }
            };
            ws.addEventListener('message', onMessage);
            ws.send(msg);
        });
    });
};
export const getWebSocket = () => ws;
