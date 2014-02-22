// Declare a variable to generate unique notification IDs
var notID = 0;

// Window initialization code. Set up the various event handlers
window.addEventListener("load", function() {
	document.getElementById("image").addEventListener("click", displayNotification);

	// set up the event listeners
	chrome.notifications.onClosed.addListener(notificationClosed);
	chrome.notifications.onClicked.addListener(notificationClicked);
	chrome.notifications.onButtonClicked.addListener(notificationBtnClick);
	
	chrome.sockets.udp.create({}, function(socketInfo) {
	  socketId = socketInfo.socketId;
	  // Setup event handler and bind socket.
	  chrome.sockets.udp.onReceive.addListener(onReceive);
	  chrome.sockets.udp.bind(socketId,
	    "0.0.0.0", 50000, function(result) {
	      if (result < 0) {
	        console.log("Error binding socket.");
	        return;
	      }
	      a = new ArrayBuffer("HELO World");
	      chrome.sockets.udp.send(socketId, a,
	        '127.0.0.1', 50000, function(sendInfo) {
	          console.log("sent " + sendInfo.bytesSent);
	      });
	  });
	});
});

function onReceive(evt) {
	console.log("Received something on UDP "+evt);
	displayNotification(evt);
}

function displayNotification(evt) {
	var options = {
		type : "image",
		title: "Image Notification",
		message: "Short message plus an image",
		imageUrl: chrome.runtime.getURL("/images/lunch.png"),
		iconUrl: chrome.runtime.getURL("/images/lunch.png"),
		priority: 0,
		buttons: []
	};
		
	chrome.notifications.create(evt+"id"+notID++, options, creationCallback);
}

function creationCallback(notID) {
	console.log("Succesfully created " + notID + " notification");
}

// Event handlers for the various notification events
function notificationClosed(notID, bByUser) {
	console.log("The notification '" + notID + "' was closed" + (bByUser ? " by the user" : ""));
}

function notificationClicked(notID) {
	console.log("The notification '" + notID + "' was clicked");
}

function notificationBtnClick(notID, iBtn) {
	console.log("The notification '" + notID + "' had button " + iBtn + " clicked");
}
