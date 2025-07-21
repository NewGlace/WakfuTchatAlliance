"use strict";
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const labelMs = document.getElementById('ms-label');
const iconMs = document.getElementById('ms-icon');
function getPingLevel(ping) {
    if (ping <= 50)
        return 0;
    else if (ping <= 100)
        return 1;
    else if (ping <= 200)
        return 2;
    else if (ping <= 400)
        return 3;
    else
        return 4;
}
function linkify(text) {
    const urlRegex = /((https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?)/gi;
    return text.replace(urlRegex, (url) => {
        const fullUrl = url.startsWith('http') ? url : 'https://' + url;
        return `<a href="${fullUrl}" target="_blank" rel="noopener noreferrer">${url}</a>`;
    });
}
function escapeHTML(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
function markdownify(text) {
    text = escapeHTML(text);
    const boldRegex = /(?<!\\)\*\*(.*?)\*\*/g;
    const italicRegex = /(?<!\\)_(.*?)_/g;
    const italic2Regex = /(?<!\\)\*(.*?)\*/g;
    const codeRegex = /(?<!\\)`(.*?)`/g;
    const underlineRegex = /(?<!\\)__(.*?)__/g;
    const middleLineRegex = /(?<!\\)~(.*?)~/g;
    const middleLine2Regex = /(?<!\\)~~(.*?)~~/g;
    return text
        .replace(underlineRegex, '<u>$1</u>')
        .replace(boldRegex, '<strong>$1</strong>')
        .replace(middleLine2Regex, '<del>$1</del>')
        .replace(italicRegex, '<em>$1</em>')
        .replace(codeRegex, '<code>$1</code>')
        .replace(italic2Regex, '<em>$1</em>')
        .replace(middleLineRegex, '<del>$1</del>')
        .replace(/\\([_*~`])/g, '$1');
}
async function findUsernameInText(text) {
    const mentions = [];
    const response = await window.electronAPI.sendWsMessage(JSON.stringify({ type: "connection" }));
    const userInGuild = JSON.parse(response.data);
    const usernames = Object.values(userInGuild).flat();
    usernames.forEach((username) => {
        if (username.toLowerCase().includes(text.toLowerCase())) {
            mentions.push(username);
        }
    });
    return mentions;
}
window.electronAPI.onPing((response) => {
    const numberTimeStamp = Number(response.timestamp);
    const pingNumber = ((Date.now() - numberTimeStamp) / 2) | 0;
    const pingLevel = getPingLevel(pingNumber);
    iconMs.src = `./assets/connection/${Math.min(pingLevel, 4)}.png`;
    labelMs.textContent = `${pingNumber} ms`;
});
window.electronAPI.onMessage(async (response) => {
    const msgContainer = document.createElement('div');
    msgContainer.classList.add('message');
    const icon = document.createElement('img');
    icon.src = `./assets/guilds/${response.guild}.png`;
    icon.classList.add('icon');
    const textWrapper = document.createElement('div');
    textWrapper.classList.add('text-wrapper');
    const line = document.createElement('div');
    line.classList.add('line');
    const guildName = (response.guild || 'Undefined').replace(/\s+/g, '').replace(/[^a-zA-Z0-9-]/g, '');
    const guild = document.createElement('span');
    guild.classList.add('guild', `guild-${guildName}`);
    guild.classList.add('meta');
    guild.textContent = `[${response.guild || '???'}] `;
    const time = document.createElement('span');
    guild.classList.add('meta');
    const date = new Date();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    time.textContent = `[${hours}:${minutes}:${seconds}] `;
    const username = document.createElement('span');
    username.classList.add('username');
    username.classList.add('meta');
    if (response.username === "Oroma") {
        username.classList.add('username-orowa');
    }
    if (response.username === "New'") {
        username.classList.add('username-new');
    }
    username.classList.add(`username-${response.username.replace(/\s+/g, '')}`);
    username.textContent = `${response.username || '???'}`;
    const colon = document.createElement('span');
    colon.textContent = ' : ';
    const content = document.createElement('span');
    content.classList.add('content');
    content.innerHTML = linkify(markdownify(response.content || ''));
    if (response.image) {
        content.classList.add('content-image');
        content.textContent = '';
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline-flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.gap = '4px';
        wrapper.style.border = '1px solid #555';
        wrapper.style.borderRadius = '3px';
        wrapper.style.padding = '2px 6px';
        wrapper.style.fontSize = '12px';
        wrapper.style.color = '#ccc';
        wrapper.style.fontFamily = 'monospace';
        wrapper.style.cursor = 'pointer';
        wrapper.style.userSelect = 'none';
        wrapper.style.lineHeight = '1';
        const icon = document.createElement('span');
        icon.textContent = '🖼️';
        const label = document.createElement('span');
        label.textContent = 'Image.png';
        wrapper.appendChild(icon);
        wrapper.appendChild(label);
        const popup = document.createElement('div');
        popup.style.position = 'absolute';
        popup.style.display = 'none';
        popup.style.padding = '5px';
        popup.style.borderRadius = '6px';
        popup.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        popup.style.zIndex = '1000';
        const img = document.createElement('img');
        img.src = response.image;
        img.style.maxWidth = '200px';
        img.style.maxHeight = '200px';
        img.style.display = 'block';
        img.style.borderRadius = '4px';
        img.style.border = '1px solid #555';
        popup.appendChild(img);
        document.body.appendChild(popup);
        wrapper.addEventListener('mouseenter', (e) => {
            popup.style.display = 'block';
            popup.style.left = '-9999px';
            popup.style.top = '-9999px';
            requestAnimationFrame(() => {
                const popupRect = popup.getBoundingClientRect();
                const margin = 10;
                let left = e.pageX + margin;
                let top = e.pageY + margin;
                if (left + popupRect.width > window.innerWidth) {
                    left = e.pageX - popupRect.width - margin;
                }
                if (top + popupRect.height > window.innerHeight) {
                    top = e.pageY - popupRect.height - margin;
                }
                popup.style.left = `${Math.max(left, margin)}px`;
                popup.style.top = `${Math.max(top, margin)}px`;
            });
        });
        wrapper.addEventListener('mouseleave', () => {
            popup.style.display = 'none';
        });
        content.appendChild(wrapper);
        wrapper.addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100vw';
            overlay.style.height = '100vh';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.8)';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            overlay.style.zIndex = '2000';
            overlay.style.cursor = 'grab';
            const imgZoom = document.createElement('img');
            imgZoom.src = response.image;
            imgZoom.style.maxWidth = '90vw';
            imgZoom.style.maxHeight = '90vh';
            imgZoom.style.borderRadius = '8px';
            imgZoom.style.cursor = 'grab';
            imgZoom.style.userSelect = 'none';
            imgZoom.style.position = 'relative';
            imgZoom.style.transition = 'transform 0.2s ease';
            overlay.appendChild(imgZoom);
            document.body.appendChild(overlay);
            let scale = 1;
            let isDragging = false;
            let startX = 0, startY = 0;
            let currentX = 0;
            let currentY = 0;
            overlay.addEventListener('wheel', (e) => {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.1 : 0.1;
                scale = Math.min(Math.max(0.5, scale + delta), 3);
                imgZoom.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
            });
            imgZoom.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX - currentX;
                startY = e.clientY - currentY;
                imgZoom.style.cursor = 'grabbing';
            });
            window.addEventListener('mouseup', () => {
                isDragging = false;
                imgZoom.style.cursor = 'grab';
            });
            window.addEventListener('mousemove', (e) => {
                if (!isDragging)
                    return;
                currentX = e.clientX - startX;
                currentY = e.clientY - startY;
                imgZoom.style.transform = `translate(${currentX}px, ${currentY}px) scale(${scale})`;
            });
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                }
            });
        });
    }
    const view = await window.electronAPI.getView();
    if (view.time)
        line.appendChild(time);
    if (view.guildName)
        line.appendChild(guild);
    line.appendChild(username);
    line.appendChild(colon);
    line.appendChild(content);
    textWrapper.appendChild(line);
    if (view.guildIcon)
        msgContainer.appendChild(icon);
    msgContainer.appendChild(textWrapper);
    messages.appendChild(msgContainer);
    messages.scrollTop = messages.scrollHeight;
});
let suggestionList = null;
input.addEventListener('input', async () => {
    if (suggestionList) {
        suggestionList.remove();
        suggestionList = null;
    }
    console.log('cursorPos:', input.selectionStart);
    console.log('input value:', input.value);
    const cursorPos = (input.selectionStart ?? 0);
    const beforeCursor = input.value.slice(0, cursorPos);
    const match = beforeCursor.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
        const mention = match[1];
        if (mention.length > 0) {
            const suggestions = await findUsernameInText(mention);
            suggestions.sort((a, b) => a.localeCompare(b));
            if (suggestions.length > 0) {
                suggestionList = document.createElement('div');
                suggestionList.classList.add('suggestion-list');
                suggestions.forEach((sugg) => {
                    const item = document.createElement('div');
                    item.classList.add('suggestion-item');
                    item.textContent = sugg;
                    if (!suggestionList)
                        return;
                    item.addEventListener('click', () => {
                        if (!suggestionList)
                            return;
                        input.value = input.value.replace(match[0], `@${sugg} `);
                        input.focus();
                        suggestionList.remove();
                    });
                    suggestionList.appendChild(item);
                });
                input.parentNode?.appendChild(suggestionList);
            }
        }
    }
});
input.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && input.value.trim() !== '') {
        window.electronAPI.sendWsMessage(JSON.stringify({ type: "sent_message", content: input.value.trim() }));
        input.value = '';
    }
});
input.addEventListener('paste', (event) => {
    const items = event.clipboardData?.items;
    if (!items)
        return;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            const file = item.getAsFile();
            if (!file)
                return;
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result;
                window.electronAPI.sendWsMessage(JSON.stringify({ type: "sent_message", content: 'Image.png', image: base64 }));
            };
            reader.readAsDataURL(file);
        }
    }
});
input.addEventListener('dragover', (e) => {
    e.preventDefault();
});
input.addEventListener('dragenter', () => {
    input.classList.add('drag-over');
});
input.addEventListener('dragleave', () => {
    input.classList.remove('drag-over');
});
input.addEventListener('drop', (e) => {
    input.classList.remove('drag-over');
    e.preventDefault();
    if (e.dataTransfer) {
        const files = e.dataTransfer.files;
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = () => {
                    const base64 = reader.result;
                    window.electronAPI.sendWsMessage(JSON.stringify({ type: "sent_message", content: 'Image.png', image: base64 }));
                };
                reader.readAsDataURL(file);
            }
        }
    }
});
