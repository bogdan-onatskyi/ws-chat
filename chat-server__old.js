const appConfig = require('./config.json');

const chatServerPort = appConfig.chatServer.port;
const chatServer = require('websocket').server;

const http = require('http');

const historyLength = 100;

let history = [];
let clients = [];

let connectedUser = false;

// function htmlEntities(str) {
//     return String(str)
//         .replace(/&/g, '&amp;').replace(/</g, '&lt;')
//         .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// }
//
// // Array with some colors
// const colors = ['red', 'green', 'blue', 'magenta', 'purple', 'plum', 'orange'];
// // ... in random order
// colors.sort(function (a, b) {
//     return Math.random() > 0.5;
// });

const httpServer = http.createServer((request, response) => {
    // Not important for us. We're writing WebSocket server,
    // not HTTP server
});
httpServer.listen(chatServerPort, () => {
    console.log(`${new Date()} chatServer is listening on port ${chatServerPort}`);
});
const wsServer = new chatServer({httpServer});

wsServer.on('request', request => {
    console.log(`${new Date()} Connection from origin ${request.origin}.`);

    const connection = request.accept(null, request.origin);

    const index = clients.push(connection) - 1;
    console.log(`${new Date()} Connection accepted.`);

    if (history.length > 0) {
        connection.sendUTF(JSON.stringify(history));
    }

    connection.on('message', msg => {
        const {userName, message, password} = JSON.parse(msg.utf8Data);

        if (password) {
            // todo Запрос в базу данных
            const setupDBConnection = require('./db/setup-connection');
            setupDBConnection();

            const serviceUsers = require('./db/service/service-users');
            serviceUsers.findUserByPassword(password)
                .then((userName) => {
                    console.log(`userName from db = ${userName}`);
                    return userName
                })
                .catch((err) => {
                    console.log(`Didn't find userName in db. Error: ${err}`);
                    return err
                });
            console.log(`Didn't find userName in db.`);
        }

        if (connectedUser === false) {
            connectedUser = userName;
        }

        console.log(`${new Date()} Received Message from ${userName}: ${message}`);

        const obj = {
            timeStamp: (new Date()).getTime(),
            userName,
            message
        };

        history.push(obj);
        history = history.slice(-historyLength);

        const json = JSON.stringify(obj);
        for (let i = 0; i < clients.length; i++) {
            clients[i].sendUTF(json);
        }
    });

    connection.on('close', connection => {
        if (connectedUser !== false) {
            console.log(`${new Date()} Peer ${connection.remoteAddress} disconnected.`);

            // remove user from the list of connected clients
            clients.splice(index, 1);

            // push back user's color to be reused by another user
            // colors.push(userColor);
        }
    });
});

module.exports = wsServer;