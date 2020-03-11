const Store = require('electron-store');
const store = new Store();
const bcrypt = require('bcryptjs');


let form = document.getElementById("ngrok-settings")

formToJson = (elements) => {
  let json = {};
  elements.forEach(element => {
    if (element.name !== "") json[element.name] = element.value
  });
  return json;
}
form.addEventListener("submit", (event) => {
  event.preventDefault();

  store.set({
    ngrok: formToJson([...form.elements])
  })
})

function saveSettings(){
  store.set('nodered.port', document.getElementById('nodered-port').value);
  store.set('nodered.username', document.getElementById('nodered-username').value);
  if (document.getElementById('nodered-password').value != null) {
      store.set('nodered.password', bcrypt.hashSync(document.getElementById('nodered-password').value, 8))
  }
}

function getSettings(){
  document.getElementById('nodered.port').value = store.get('nodered-port')
  document.getElementById('nodered.username').value = store.get('nodered-username')
}