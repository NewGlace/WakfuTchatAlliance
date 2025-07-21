import { app, ipcMain } from 'electron';
import * as path from 'path';
import fs from 'fs';
const tokenPath = path.join(app.getPath('userData'), 'token.json');
const viewPath = path.join(app.getPath('userData'), 'view.json');
export function startIcp() {
    ipcMain.handle('get-token', () => {
        if (!fs.existsSync(tokenPath))
            return null;
        const data = fs.readFileSync(tokenPath, 'utf-8');
        return JSON.parse(data).token;
    });
    ipcMain.handle('get-view', () => {
        if (!fs.existsSync(viewPath)) {
            fs.writeFileSync(viewPath, JSON.stringify({ view: { guildName: true, guildIcon: true, time: false } }), 'utf-8');
            return { guildName: true, guildIcon: true, time: false };
        }
        ;
        const data = fs.readFileSync(viewPath, 'utf-8');
        return JSON.parse(data).view;
    });
    ipcMain.handle('set-view', (_, view) => {
        fs.writeFileSync(viewPath, JSON.stringify({ view }), 'utf-8');
    });
    ipcMain.handle('get-app-version', () => {
        return "1.0.2";
    });
}
