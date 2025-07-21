"use strict";
function editElement(elem, text, text2) {
    const erreur = document.getElementById('error-' + elem.id);
    if (text) {
        elem.classList.remove('error');
        erreur.innerText = '';
        erreur.style.display = 'none';
    }
    else {
        if (text2) {
            erreur.innerText = text2;
            erreur.style.display = 'block';
        }
        elem.classList.add('error', 'shake');
        setTimeout(() => elem.classList.remove('shake'), 500);
    }
}
const guildMenu = document.getElementById('guild');
async function addGuildsToMenu() {
    const response = await window.electronAPI.sendWsMessage(JSON.stringify({ type: "guilds" }));
    const guilds = JSON.parse(response.data);
    if (!guilds || guilds.length === 0) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Aucune guilde disponible';
        guildMenu.appendChild(option);
        return;
    }
    guilds.forEach(guild => {
        const option = document.createElement('option');
        option.value = guild;
        option.textContent = guild;
        guildMenu.appendChild(option);
    });
}
addGuildsToMenu().catch(console.error);
const submitButton = document.getElementById('btn-submit');
submitButton.addEventListener('click', async () => {
    const pseudoInput = document.getElementById('pseudo');
    const passwordInput = document.getElementById('password');
    const pseudo = pseudoInput?.value.trim() ?? '';
    const password = passwordInput?.value.trim() ?? '';
    const guild = guildMenu?.value.trim() ?? '';
    editElement(pseudoInput, pseudo, "Champs obligatoire !");
    editElement(guildMenu, guild);
    if (password.length === 0) {
        editElement(passwordInput, '', 'Champs obligatoire !');
    }
    else if (password.length < 6) {
        editElement(passwordInput, '', 'Le mot de passe doit faire au moins 6 caractères');
    }
    else if (password.length > 20) {
        editElement(passwordInput, '', 'Le mot de passe doit faire max 20 caractères');
    }
    else
        editElement(passwordInput, password);
    if (!pseudo || !password || !guild) {
        return;
    }
    const response = await window.electronAPI.sendWsMessage(JSON.stringify({ type: "create_account", username: pseudo, password: password, guildname: guild }));
    if (response.code === "error") {
        let r = false;
        if (response.reason === "missing_parameters") {
            return;
        }
        if (response.reason === "username_already_exists") {
            editElement(pseudoInput, '', 'Ce pseudo est déjà utilisé');
            r = true;
        }
        if (response.reason === "error_password_length") {
            editElement(passwordInput, '', 'Le mot de passe doit faire au moins 6 caractères');
            r = true;
        }
        else if (response.reason === "error_hashing_password") {
            editElement(passwordInput, '', 'Une erreur est survenue lors de la création du mot de passe');
        }
        if (r)
            return;
    }
    window.location.href = 'tchat.html';
});
