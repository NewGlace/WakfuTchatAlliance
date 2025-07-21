"use strict";
(async () => {
    try {
        const token = await window.electronAPI.getToken();
        if (token) {
            const response = await window.electronAPI.sendWsMessage(JSON.stringify({ type: "auth", token: token.toString() }));
            if (response.code === "success") {
                window.location.href = 'tchat.html';
            }
        }
        const response = await window.electronAPI.sendWsMessage(JSON.stringify({ type: "version" }));
        const version = window.electronAPI.getAppVersion();
        const banner = document.getElementById('update-banner');
        if (banner && response.version !== version)
            banner.style.display = 'block';
    }
    catch (error) {
    }
})();
