"use strict";
function editElements(elem, text, text2) {
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
const submitButtons = document.getElementById('btn-submit');
submitButtons.addEventListener('click', async () => {
    const pseudoInput = document.getElementById('pseudo');
    const passwordInput = document.getElementById('password');
    const pseudo = pseudoInput?.value.trim() ?? '';
    const password = passwordInput?.value.trim() ?? '';
    editElements(pseudoInput, pseudo, "Champs obligatoire !");
    editElements(passwordInput, password, "Champs obligatoire !");
    if (!pseudo || !password) {
        return;
    }
    const response = await window.electronAPI.sendWsMessage(JSON.stringify({ type: "login", username: pseudo, password: password }));
    if (response.code === "error") {
        if (response.reason === "missing_parameters") {
            return;
        }
        if (response.reason === "username_or_password") {
            editElements(pseudoInput, '', 'Pseudo ou mot de passe incorrect');
            editElements(passwordInput, '', 'Pseudo ou mot de passe incorrect');
            return;
        }
    }
    window.location.href = 'tchat.html';
});
