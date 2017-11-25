const http = require('http');
// const url = require('url');
const WebSocket = require('ws');

const users = [ // todo Заменить на базу данных
    {userName: 'user', password: 'password', isAdmin: true, isBanned: false, isMuted: false, color: 'green'},
    {userName: 'user1', password: 'password1', isAdmin: false, isBanned: false, isMuted: false, color: 'green'},
    {userName: 'user2', password: 'password2', isAdmin: false, isBanned: false, isMuted: false, color: 'green'},
    {userName: 'user3', password: 'password3', isAdmin: false, isBanned: false, isMuted: false, color: 'green'},
];

let loggedUsers = [];

let isChatServerRunning = false;

module.exports = app => {
    const server = http.createServer(app);
    const wss = new WebSocket.Server({server});

    server.listen(8080, () => {
        console.log(`Chat server is listening on ${server.address().port}`);
        isChatServerRunning = true;
    });

    wss.on('connection', ws => {

        ws.on('message', message => {

            console.log(`received chat message: ${message}`);

            let requestObject = {};
            try {
                requestObject = JSON.parse(message);
            } catch (err) {
                console.log(`JSON.parse error: ${err}`);
                return;
            }

            const userName = requestObject.userName;

            let responseObject = {
                timeStamp: (new Date()).getTime(),
                userName
            };

            const handleGetUserInfo = () => {

                const user = users.find(u => u.userName === userName);

                responseObject = {
                    ...responseObject,
                    type: 'responseGetUserInfo',
                    data: user
                };

                ws.send(JSON.stringify(responseObject));
            };

            const handleNewUser = () => {

                let isLogged = false;
                loggedUsers.forEach(user => {
                    if (user.userName === userName) {
                        isLogged = true;
                    }
                });

                if (!isLogged) {

                    responseObject = {
                        ...responseObject,
                        type: 'responseNewUser',
                        message: `${userName} logged in chat...`
                    };

                    loggedUsers.push({
                        userName,
                        ws
                    });
                }
            };

            const handleNewMessage = () => {

            };

            const handleUserExit = () => {

                responseObject = {
                    ...responseObject,
                    type: 'responseUserExit',
                    message: `${userName} left chat...`
                };

                loggedUsers = loggedUsers.filter(user => {
                    if (user.userName === userName)
                        user.ws.terminate();
                    else
                        return user;
                });
            };


            switch (requestObject.type) {
                case 'getUserInfo':
                    handleGetUserInfo();
                    return;

                case 'newUser':
                    handleNewUser();
                    break;

                // let isLogged = false;
                // loggedUsers.forEach(user => {
                //     if (user.userName === requestObject.userName) {
                //         isLogged = true;
                //     }
                // });
                //
                // if (!isLogged || requestObject.message === null) {
                //     requestObject.type = 'serverMsg';
                //     requestObject.message = `${requestObject.userName} logged in chat...`;
                //     loggedUsers.push({
                //         userName: requestObject.userName,
                //         ws
                //     });
                // }

                case 'newMessage':
                    handleNewMessage();
                    break;

                case 'userExit':
                    handleUserExit();
                    break;

                // loggedUsers = loggedUsers.filter(user => user.userName !== requestObject.userName);
                //
                // requestObject.type = 'serverMsg';
                // requestObject.message = `${requestObject.userName} left chat...`;
                //
                // loggedUsers.forEach(user => {
                //     if (user.userName === requestObject.userName) user.ws.terminate();
                // });
                default:
                    return;
            }

            // Broadcast message to all connected users
            wss.clients.forEach(client => {
                // if (client !== ws && client.readyState === WebSocket.OPEN) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify(requestObject));
                    console.log(`sent chat message: ${JSON.stringify(requestObject)}`);
                }
            });
        });
    });
};