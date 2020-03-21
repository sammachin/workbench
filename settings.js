const Store = require('electron-store');
const store = new Store();
const bcrypt = require('bcryptjs');
const { ipcRenderer } = require('electron')


let form = document.getElementById("settings")
let savedSettings = store.get("settings")

formToJson = (elements) => {
  let json = {}
  elements.forEach(element => {
    if (element.name !== "") json[element.name] = element.value
  })
  return json
}

jsonToForm = (settings, form) => {
  Object.keys(settings).forEach(settingName => {
    form.elements[settingName].value = settings[settingName]
  })
  form.elements["nodered-password"].value = ""
}

hasNRChanged = (settings) => {
  var changed = false
  for (k in savedSettings) {
      if (k.match(/nodered-.*/g)) {
          if (savedSettings[k] != settings[k]){
          changed = true
          }
      }
  }
  return changed
}


form.addEventListener("submit", (event) => {
  event.preventDefault();
  let settings = formToJson([...form.elements])
  
  if (settings["nodered-password"] != ""){
    settings["nodered-password"] = bcrypt.hashSync(settings["nodered-password"], 8)
  } else {
    settings["nodered-password"] = savedSettings["nodered-password"]
  }

  store.set({
    "settings": settings
  })
  console.log(settings)

  if (hasNRChanged(settings)){
    var r = confirm("Node-RED Settings will only take effect on a restart, do you want to restart now");
    if (r ==true) {
      ipcRenderer.send('restart-request', 'restart')
    } else{
      close()
    }
  } else{
    close()
  }  
})

window.addEventListener('load', (event) => {
  if (savedSettings) {
    jsonToForm(savedSettings, form)
    console.log(savedSettings);
  }
});
