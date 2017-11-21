const chatClient = require('websocket').client;



// if user is running mozilla then use it's built-in WebSocket
// window.WebSocket = window.WebSocket || window.MozWebSocket;

// const connection = new WebSocket('ws://127.0.0.1:8080');

const connection = new chatClient('ws://127.0.0.1:8080');

connection.onopen = function () {
    console.log('connection is opened and ready to use');
};

connection.onerror = function (error) {
    // an error occurred when sending/receiving data
    console.log('an error occurred when sending/receiving data');
};

connection.onmessage = function (message) {
    // try to decode json (I assume that each message
    // from server is json)
    try {
        const json = JSON.parse(message.data);
    } catch (e) {
        console.log(`This doesn't look like a valid JSON: ${message.data}`);
        return;
    }
    // handle incoming message
    console.log(`incoming message: ${json}`);
};