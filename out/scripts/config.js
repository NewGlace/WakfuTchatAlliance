"use strict";
const settingsBtn = document.getElementById('btn-settings');
const settingsMenu = document.getElementById('menu-option');
const menu2 = document.getElementById('menu-joueurs');
// const passwordForm = document.getElementById('password-form') as HTMLInputElement;
// const deleteTokens = document.getElementById('delete-tokens') as HTMLInputElement;
const oldPassword = document.getElementById('old-password');
const newPassword = document.getElementById('new-password');
const validPassword = document.getElementById('valid-password');
const toggleGuildNames = document.getElementById('toggle-guild-names');
const toggleTimestamps = document.getElementById('toggle-timestamps');
const toggleGuildIcons = document.getElementById('toggle-guild-icons');
checkBox(toggleGuildNames, 'guildName');
checkBox(toggleTimestamps, 'time');
checkBox(toggleGuildIcons, 'guildIcon');
async function setCheckboxValue() {
    const view = await window.electronAPI.getView();
    toggleGuildNames.checked = view.guildName;
    toggleTimestamps.checked = view.time;
    toggleGuildIcons.checked = view.guildIcon;
}
setCheckboxValue();
function checkBox(elem, name) {
    elem.addEventListener('change', async (e) => {
        const target = e.target;
        const showImages = target ? target.checked : false;
        const view = await window.electronAPI.getView();
        view[name] = showImages;
        window.electronAPI.setView(view);
    });
}
function shakeElem(elem) {
    elem.classList.add('error', 'shake');
    setTimeout(() => elem.classList.remove('shake'), 500);
}
validPassword.addEventListener('click', (e) => {
    if (oldPassword !== newPassword) {
        shakeElem(oldPassword);
        shakeElem(newPassword);
    }
});
settingsBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    settingsMenu.classList.toggle('hidden');
    menu2.classList.add('hidden');
});
window.addEventListener('click', () => {
    settingsMenu.classList.add('hidden');
});
settingsMenu.addEventListener('click', (e) => {
    e.stopPropagation();
});
//passwordForm.addEventListener('click', () => {
//  if (passwordForm.style.display === 'flex') {
//    passwordForm.style.display = 'none';
//  } else {
//    passwordForm.style.display = 'flex';
//  }
//});
