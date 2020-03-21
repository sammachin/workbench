
js = `{"nodered-port":"2880","nodered-username":"sammachin","nodered-password":"$2a$08$hzeTEqafKAhwDcKM2.axQ.w9jKdArxORYipiwmJPFHdbxKVoOAVdm","ngrok-authtoken":"2pHej174bhFj3iU1Y4GKK_4kKYic49Gg4EBK3oEA9Yx","ngrok-region":"us","ngrok-subdomain":"electron","ngrok-auth":""}`
njs  = `{"nodered-port":"1880","nodered-username":"sammachin","nodered-password":"$2a$08$hzeTEqafKAhwDcKM2.axQ.w9jKdArxORYipiwmJPFHdbxKVoOAVdm","ngrok-authtoken":"2pHej174bhFj3iU1Y4GKK_4kKYic49Gg4EBK3oEA9Yx","ngrok-region":"us","ngrok-subdomain":"electron","ngrok-auth":""}`

savedSettings = JSON.parse(js)
formSettings = JSON.parse(njs)



for (k in savedSettings) {
    if (k.match(/nodered-.*/g)) {
        console.log(savedSettings[k])
    }
}