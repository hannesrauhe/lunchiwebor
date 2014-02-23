var lunchinator = {
    _members: {"127.0.0.1":[]},
    _socketId: -1,
    _processMessage: function(packet) {
        console.log(packet);      
        lunchinator.onMessageReceived(packet.remoteAddress,ab2str(packet.data));
    },
    _sendMessage: function(ip,msg) {
        console.log("Sending Message "+msg+" to IP "+ip);
        chrome.sockets.udp.send(lunchinator._socketId, str2ab(msg),
           ip, 50000, function(sendInfo) {
              console.log("sent " + sendInfo.bytesSent);
        });        
    },
    onMessageReceived: function(ip,msgText) {
        console.log(msgText);        
    },
    call : function(message,ip) {
        if(this._socketId<0) {
            console.log("Lunchinator not started");
            return -1;
        }
        
        if(ip) {
            lunchinator._sendMessage(ip,message);
        } else {
            for(var m in lunchinator._members) {
                lunchinator._sendMessage(m,message);
            }
        }
    },
    start: function () {
        chrome.sockets.udp.create({}, function(socketInfo) {
            console.log("Starting Lunchinator");
            lunchinator._socketId = socketInfo.socketId;
            chrome.sockets.udp.onReceive.addListener(lunchinator._processMessage);
            chrome.sockets.udp.bind(lunchinator._socketId, "0.0.0.0", 50000, function(result) {
        	    if (result < 0) {
        	        console.log("Error binding socket.");
        	        return;
        	    }
                console.log("Lunchinator started");
        	});
        });
    }
};

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}