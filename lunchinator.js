/***
 * @author Hannes Rauhe hannes@notapaper.de
 * @brief contains the lunchinator object which implements 
 * the protocol for lunchinator communication 
 */

var lunchinator = {
    _peer_timeout: {},
    _peer_info: {},
    _members: {"127.0.0.1":{}},
    _socketId: -1,
    _processPacket: function(packet) {
        console.log(packet);
        sender = packet.remoteAddress;
        if(!(sender in lunchinator._peer_timeout)) {
            lunchinator.onPeerAdded(sender);
        }
        lunchinator._peer_timeout[sender]= Math.round(new Date().getTime() / 1000);
        
        pData = ab2str(packet.data);
        if(lunchinator._checkGroup(sender,pData)) {
            if(sender.indexOf("127.")!=0) {
                lunchinator._members[sender]={};
                console.log(lunchinator._members);
            }
            if(pData.indexOf("HELO")==0) {
                lunchinator._processEvent(sender,pData);
            } else {
                lunchinator.onMessageReceived(sender,pData);
            }
        }
    },
    _processEvent: function(sender,msg) {
        /*
        cmd.startswith("HELO_REQUEST_DICT"):
                self._update_peer_info(ip, json.loads(value))
                self.call("HELO_DICT "+json.dumps(self._createMembersDict()),client=ip)                   
                
            elif cmd.startswith("HELO_DICT"):
                #the master send me the list of _members - yeah
                ext_members = json.loads(value)
                self._updateMembersDict(ext_members)
                if self.my_master==-1:
                    self.call("HELO_REQUEST_INFO "+self._build_info_string())
                    
                self.my_master = ip
                                    
            elif cmd.startswith("HELO_LEAVE"):
                #the sender tells me, that he is going
                if ip in self._members:
                    self.lockMembers()
                    try:
                        self._members.remove(ip)
                    finally:
                        self.releaseMembers()
                    self._memberRemoved(ip)
                self.call("HELO_DICT "+json.dumps(self._createMembersDict()),client=ip)
                "HELO"
                */
    },
    _checkGroup: function(sender,msg) {
        if(sender.indexOf("127.")==0) {
            return true;
        }
        spl=msg.indexOf(" ");
        if(spl<=1) {
            return true;
        }
        cmd=msg.substr(0,spl);
        value=msg.substr(spl);
        
        if(cmd=="HELO_INFO") {
            lunchinator._updatePeerInfo(sender,JSON.parse(value));
        } else if(cmd=="HELO_REQUEST_INFO") {
            lunchinator._updatePeerInfo(sender,JSON.parse(value));
            lunchinator.call("HELO_INFO {\"name\":\"lunchiwebor\"}",sender);
        } 
         
        return true;
        /*
        if addr.startswith("127."):
            return True        
        own_group = get_settings().get_group()
        
        try:
            if " " in data:
                (cmd, value) = data.split(" ",1)
                if cmd.startswith("HELO_INFO"):
                    self._update_peer_info(addr, json.loads(value), requestAvatar=False)
                elif cmd.startswith("HELO_REQUEST_INFO"):
                    self._update_peer_info(addr, json.loads(value), requestAvatar=False)
                    self.call("HELO_INFO "+self._build_info_string(), client=addr)
        except:
            log_exception("was not able to parse Info from",data,addr)
        
        if len(own_group)==0:
            #accept anything as long as i do not have a group
            return True
            
        return self._peer_info.has_key(addr) and self._peer_info[addr].has_key("group") and self._peer_info[addr]["group"] == own_group
         */
    },
    _sendMessage: function(ip,msg) {
        console.log("Sending Message "+msg+" to IP "+ip);
        
        chrome.sockets.udp.create({}, function(socketInfo) {
            socketId = socketInfo.socketId;
            chrome.sockets.udp.bind(socketId, "0.0.0.0", 0, function(result) {
                if (result < 0) {
                    console.log("Error binding socket.");
                    return;
                }
                chrome.sockets.udp.send(socketId, str2ab(msg),
                   ip, 50000, function(sendInfo) {
                      console.log("sent " + sendInfo.bytesSent);
                });
            });
        });
        /*
        chrome.sockets.udp.send(lunchinator._socketId, str2ab(msg),
           ip, 50000, function(sendInfo) {
              console.log("sent " + sendInfo.bytesSent);
        });*/        
    },
    _updatePeerInfo: function(peer,info) {
        lunchinator._peer_info[peer]=info;
    },
    onMessageReceived: function(ip,msgText) {
        console.log(msgText);        
    },
    onPeerAdded: function(ip) {
        console.log(ip+" added to peers");        
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
            chrome.sockets.udp.onReceive.addListener(lunchinator._processPacket);
            chrome.sockets.udp.bind(lunchinator._socketId, "0.0.0.0", 50000, function(result) {
        	    if (result < 0) {
        	        console.log("Error binding socket.");
        	        return;
        	    }
                console.log("Lunchinator started");
        	});
        });
    } ,
    stop: function () {
        chrome.sockets.udp.close(lunchinator._socketId, function() {
            console.log("Lunchinator stopped");
        });
    }
};

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}

function str2ab(str) {
  var buf = new ArrayBuffer(str.length); // 2 bytes for each char
  var bufView = new Uint8Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}