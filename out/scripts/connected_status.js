"use strict";
const btn = document.getElementById('connecte-btn');
const menu = document.getElementById('menu-joueurs');
const connecteLabel = document.getElementById('connecte-label');
const settingsMenu2 = document.getElementById('menu-option');
let data = { "Desperados": [], "Ancien Monde": [], "Le Tier-Quar": [] };
async function loadPlayer() {
    const response = await window.electronAPI.sendWsMessage(JSON.stringify({ type: "connection" }));
    console.log(response);
    const d = JSON.parse(response.data);
    let playerCount = Object.values(d || {}).reduce((count, value) => count += value.length, 0);
    connecteLabel.textContent = `${playerCount} ${playerCount <= 1 ? "joueur connecté" : "joueurs connectés"}`;
    data = d;
}
loadPlayer();
window.electronAPI.onStats((d) => {
    let playerCount = Object.values(d || {}).reduce((count, value) => count += value.length, 0);
    connecteLabel.textContent = `${playerCount} ${playerCount <= 1 ? "joueur connecté" : "joueurs connectés"}`;
    data = d;
});
function renderMenu() {
    menu.innerHTML = '';
    Object.entries(data).forEach(([guild, membres]) => {
        const item = document.createElement('div');
        const arrow = document.createElement('span');
        arrow.textContent = '▶';
        arrow.style.display = 'inline-block';
        arrow.style.marginRight = '6px';
        arrow.style.transition = 'transform 0.3s ease';
        arrow.classList.add("rotate");
        const label = document.createElement('span');
        const count = document.createElement('span');
        label.style.fontWeight = 'bold';
        label.textContent = `${guild}`;
        const guildName = (guild || 'Undefined')
            .replace(/\s+/g, '')
            .replace(/[^a-zA-Z0-9-]/g, '');
        count.textContent = ` (${membres.length})`;
        label.classList.add(`guild-${guildName}`);
        item.appendChild(arrow);
        item.appendChild(label);
        item.appendChild(count);
        const sousMenu = document.createElement('div');
        sousMenu.className = 'guilde-joueurs';
        const msg = document.getElementById('messages');
        menu.style.maxHeight = msg.scrollHeight + "px";
        membres.forEach(joueur => {
            const div = document.createElement('div');
            div.textContent = joueur;
            if (joueur == "Oroma") {
                div.classList.add('username-oro');
            }
            else if (joueur === "New'") {
                div.classList.add('username-new');
            }
            else
                div.classList.add('username');
            sousMenu.appendChild(div);
        });
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            arrow.classList.toggle('active');
            const isOpen = sousMenu.classList.contains('active');
            if (isOpen) {
                sousMenu.style.maxHeight = sousMenu.scrollHeight + 'px';
                requestAnimationFrame(() => {
                    sousMenu.style.maxHeight = '0px';
                    sousMenu.classList.remove('active');
                });
            }
            else {
                sousMenu.classList.add('active');
                sousMenu.style.maxHeight = sousMenu.scrollHeight + 'px';
            }
        });
        menu.appendChild(item);
        menu.appendChild(sousMenu);
    });
}
btn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu2.classList.add('hidden');
    menu.classList.toggle('hidden');
    renderMenu();
});
window.addEventListener('click', () => {
    menu.classList.add('hidden');
    document.querySelectorAll('.guilde-joueurs').forEach(el => el.classList.remove('active'));
});
