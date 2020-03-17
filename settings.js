const Store = require('electron-store');
const store = new Store();
const bcrypt = require('bcryptjs');


let form = document.getElementById("settings")
let savedSettings = store.get("settings")

formToJson = (elements) => {
  let json = {};
  elements.forEach(element => {
    if (element.name !== "") json[element.name] = element.value
  });
  return json;
}

jsonToForm = (settings, form) => {
  Object.keys(settings).forEach(settingName => {
    form.elements[settingName].value = settings[settingName]
  })
  form.elements["nodered-password"].value = ""
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  let settings = formToJson([...form.elements]);
  
  if (settings["nodered-password"] != ""){
    settings["nodered-password"] = bcrypt.hashSync(settings["nodered-password"], 8)
  } else {
    settings["nodered-password"] = savedSettings["nodered-password"]
  }

  store.set({
    "settings": settings
  })
})

window.addEventListener('load', (event) => {
  if (savedSettings) {
    jsonToForm(savedSettings, form)
  }
});