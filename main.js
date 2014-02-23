// Declare a variable to generate unique notification IDs
var notID = 0;

// Window initialization code. Set up the various event handlers
window.addEventListener("load", function() {
    document.getElementById("send").addEventListener("click", sendMessage);
    document.getElementById("stop").addEventListener("click", lunchinator.stop);

	// set up the event listeners
	chrome.notifications.onClosed.addListener(notificationClosed);
	chrome.notifications.onClicked.addListener(notificationClicked);
	chrome.notifications.onButtonClicked.addListener(notificationBtnClick);
	lunchinator.start();
	lunchinator.onMessageReceived = displayNotification;
	lunchinator.onPeerAdded = addPeerToTable;
});

function sendMessage(evt) {
    lunchinator.call(document.getElementById("messageToSend").value);
}

function displayNotification(sender,msg) {
	var options = {
		type : "image",
		title: "Message from "+sender,
		message: /*"Text: "+*/msg,
		imageUrl: chrome.runtime.getURL("/images/lunch.png"),
		iconUrl: chrome.runtime.getURL("/images/lunch128.png"),
		priority: 0,
		buttons: []
	};
		
	chrome.notifications.create("id"+notID++, options, creationCallback);
}

function addPeerToTable(sender) {
    //console.log(sender);
    row = document.getElementById("users").insertRow(1);
    row.insertCell(0).innerHTML = sender;
    row.insertCell(1).innerHTML = sender;
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
