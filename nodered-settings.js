const Store = require('electron-store');
const store = new Store();
var bcrypt = require('bcryptjs');

function saveSettings(){
    store.set('nodered.port', document.getElementById('port').value);
    store.set('nodered.username', document.getElementById('username').value);
    if (document.getElementById('password').value != null) {
        store.set('nodered.password', bcrypt.hashSync(document.getElementById('password').value, 8))
    }
}


function getSettings(){
    document.getElementById('port').value = store.get('nodered.port')
    document.getElementById('username').value = store.get('nodered.port')
}