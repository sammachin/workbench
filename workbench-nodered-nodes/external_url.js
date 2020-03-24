module.exports = function(RED) {
    "use strict";
    function ExternalURL(n) {
        RED.nodes.createNode(this,n);
        var node = this;
        RED.events.on("external_url", function(url){
            var msg = {};
            msg.payload=url
            node.send(msg);
        })
    }
    RED.nodes.registerType("ExternalURL",ExternalURL);
    
    RED.httpAdmin.post('/electron/external_url', RED.auth.needsPermission('electron.read'), function(req,res){
        RED.events.emit("external_url", req.body.url)
        res.send('ok');
      });  

}