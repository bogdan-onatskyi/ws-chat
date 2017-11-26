const http = require('http');
const WebSocket = require('ws');

const users = require('./users');

let loggedUsersArray = [];

let isChatServerRunning = false;

module.exports = app => {

    if (isChatServerRunning) return;

    const server = http.createServer(app);
    const wss = new WebSocket.Server({server});

    server.listen(8080, () => {
        console.log(`Chat server is listening on ${server.address().port}`);
        isChatServerRunning = true;
    });

    wss.on('connection', ws => {

        ws.on('message', message => {

            if (process.env.NODE_ENV === 'development') {
                console.log(`received chat message: ${message}`);
            }

            let user = {};
            let userName, isAdmin, isBanned, isMuted, color;

            let requestObject = {};
            try {
                requestObject = JSON.parse(message);
            } catch (err) {
                console.log(`JSON.parse error: ${err}`);
                return;
            }

            userName = requestObject.userName;

            let responseObject = {
                timeStamp: (new Date()).getTime(),
                userName
            };

            const handleGetUserInfo = () => {
                user = users.find(u => u.userName === userName);

                responseObject = {
                    ...responseObject,
                    type: 'responseGetUserInfo',
                    data: user
                };

                ws.send(JSON.stringify(responseObject));
            };

            const handleGetUsersList = () => {
                responseObject = {
                    ...responseObject,
                    type: 'responseGetUsersList',
                    data: [...loggedUsersArray.map(user => {
                        const {userName, isAdmin, isBanned, isMuted, color} = user;
                        return {userName, isAdmin, isBanned, isMuted, color};
                    })
                        .sort((a, b) => {
                            if (a > b) return 1;
                            if (a < b) return -1;
                        })
                    ]
                };

                ws.send(JSON.stringify(responseObject));
            };

            const handleNewUser = () => {
                user = users.find(u => u.userName === userName);

                responseObject = {
                    ...responseObject,
                    type: 'responseNewUser',
                    message: `Chat message: ${userName} logged in chat...`
                };

                loggedUsersArray.push({
                    userName: user.userName,
                    isAdmin: user.isAdmin,
                    isBanned: user.isBanned,
                    isMuted: user.isMuted,
                    color: user.color,
                    ws
                });
            };

            const handleNewMessage = () => {
                responseObject = {
                    ...responseObject,
                    type: 'responseNewMessage',
                    message: requestObject.message
                };
            };

            const handleUserExit = () => {
                responseObject = {
                    ...responseObject,
                    type: 'responseUserExit',
                    message: `Chat message: ${userName} left chat...`
                };

                loggedUsersArray = loggedUsersArray.filter(user => user.ws !== ws);

                ws.terminate(); // todo Вызывает обрыв соединения
            };

            const handleSetIsMuted = () => {
                responseObject = {
                    ...responseObject,
                    type: 'responseSetIsMuted',
                    message: `Chat message: ${userName} is muted...`
                };

                for (let user of users) {
                    console.log(`125 requestObject.userName = ${requestObject.userName}`);
                    if (user.userName === requestObject.userName) {
                        user = {
                            ...user,
                            isMuted: requestObject.isMuted
                        };
                        console.log(`131 requestObject.isMuted = ${requestObject.isMuted}`);
                    }
                }
            };

            switch (requestObject.type) {
                case 'getUserInfo':
                    handleGetUserInfo();
                    return;

                case 'getUsersList':
                    handleGetUsersList();
                    return;

                case 'newUser':
                    handleNewUser();
                    break;

                case 'newMessage':
                    handleNewMessage();
                    break;

                case 'userExit':
                    handleUserExit();
                    break;

                case 'setIsMuted':
                    console.log(` 156 `);
                    handleSetIsMuted();
                    break;

                default:
                    return;
            }

            // Broadcast message to all connected users
            wss.clients.forEach(client => {
                // if (client !== ws && client.readyState === WebSocket.OPEN) {
                if (client.readyState === WebSocket.OPEN) {
                    const sendMessage = JSON.stringify(responseObject);

                    client.send(sendMessage);

                    if (process.env.NODE_ENV === 'development') {
                        console.log(`sent chat message: ${sendMessage}`);
                    }
                }
            });
        });
        ws.on('close', message => {
            ws.terminate();
        });
    });
};