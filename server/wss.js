const WebSocket = require('ws');
const url = require('url');
const toString = require('../utils/utils').toString;

const Users = require('./users').Users;
let loggedUsersArray = [];

const wss = new WebSocket.Server({port: 8080});

wss.on('connection', (ws, request) => {

    const location = url.parse(request.url, true);
    const userToken = location.query.token;
    //
    //     //ws.id = 'random string';
    //     // ws.user = User.find('token',userToken).one();

    console.log(`request.url = ${request.url}`);
    console.log(`userToken = ${userToken}`);
    console.log(`location = ${toString(location)}`);

    ws.on('open', () => {
        ws.id = 'random';
        // ws.user =


        //     const location = url.parse(req.url, true);
        //     const userToken = location.query.token;
        //
        //     //ws.id = 'random string';
        //     // ws.user = User.find('token',userToken).one();
        //
        // let userToken = server.query('token');
        // // find user by token


        console.log('connected');
        ws.send(Date.now());
    });

    // ws.on('message', message => {
    //
    //     console.log(`received: ${message}`);
    // });

    ws.on('message', message => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`received chat message: ${message}`);
        }

        let requestObject = {};
        try {
            requestObject = JSON.parse(message);
        } catch (err) {
            console.log(`JSON.parse error: ${err}`);
            return;
        }

        let user = {};
        const timeStamp = (new Date()).getTime();
        const userName = requestObject.userName;

        let responseObject = {
            timeStamp,
            userName
        };

        const getUserInfo = () => {
            user = Users.find(user => user.userName === userName);
            if (user === undefined) {
                console.log(`getUserInfo: User ${userName} didn't find.`);
                return;
            }

            responseObject = {
                ...responseObject,
                type: 'responseGetUserInfo',
                data: user
            };

            ws.send(JSON.stringify(responseObject));
        };

        const getOnlineUsersList = () => {

            loggedUsersArray.forEach(loggedUser => {
                Users.forEach(user => {
                    if (loggedUser.userName === user.userName) {
                        const {isBanned, isMuted, color} = user;

                        loggedUser.isBanned = isBanned;
                        loggedUser.isMuted = isMuted;
                        loggedUser.color = color;
                    }
                });
            });

            const array = loggedUsersArray.map(user => {
                const {userName, isAdmin, isBanned, isMuted, color} = user;
                return {userName, isAdmin, isBanned, isMuted, color};
            });

            array.sort((a, b) => {
                if (a.userName > b.userName) return 1;
                if (a.userName < b.userName) return -1;
            });

            responseObject = {
                ...responseObject,
                type: 'responseGetOnlineUsersList',
                data: array
            };
        };

        const getBannedUsersList = () => {
            const array = [];

            Users.forEach(user => {
                if (user.isBanned) {
                    const {userName, isAdmin, isBanned, isMuted, color} = user;

                    array.push({
                        userName, isAdmin, isBanned, isMuted, color
                    });
                }
            });

            array.sort((a, b) => {
                if (a.userName > b.userName) return 1;
                if (a.userName < b.userName) return -1;
            });

            responseObject = {
                ...responseObject,
                type: 'responseGetBannedUsersList',
                data: array
            };
        };

        const newUser = () => {
            responseObject = {
                ...responseObject,
                type: 'responseNewUser',
                message: `Chat message: ${userName} logged in chat...`
            };

            user = Users.find(user => user.userName === userName);
            if (user === undefined) {
                console.log(`newUser: User ${userName} didn't find.`);
                return;
            }

            const {isAdmin, isBanned, isMuted, color} = user;
            loggedUsersArray.push({
                userName, isAdmin, isBanned, isMuted, color,
                ws
            });
        };

        const newMessage = () => {
            responseObject = {
                ...responseObject,
                type: 'responseNewMessage',
                message: requestObject.message
            };
        };

        const userExit = () => {
            responseObject = {
                ...responseObject,
                type: 'responseUserExit',
                message: `Chat message: ${userName} left chat...`
            };

            loggedUsersArray = loggedUsersArray.filter(user => user.ws !== ws);
            ws.close();
        };

        const setIsMuted = () => {
            const text = requestObject.isMuted ? '' : 'un';
            responseObject = {
                ...responseObject,
                type: 'responseSetIsMuted',
                message: `Chat message: ${userName} is ${text}muted...`
            };

            Users.forEach(user => {
                if (user.userName === requestObject.userName) {
                    user.isMuted = requestObject.isMuted;
                }
            });
        };

        const setIsBanned = () => {
            const text = requestObject.isBanned ? '' : 'un';
            responseObject = {
                ...responseObject,
                type: 'responseSetIsBanned',
                message: `Chat message: ${userName} is ${text}banned...`
            };

            Users.forEach(user => {
                if (user.userName === requestObject.userName) {
                    user.isBanned = requestObject.isBanned;
                }
            });
        };

        switch (requestObject.type) {
            case 'getUserInfo':
                getUserInfo();
                return;

            case 'getOnlineUsersList':
                getOnlineUsersList();
                break;

            case 'getBannedUsersList':
                getBannedUsersList();
                break;

            case 'newUser':
                newUser();
                break;

            case 'newMessage':
                newMessage();
                break;

            case 'userExit':
                userExit();
                break;

            case 'setIsMuted':
                setIsMuted();
                break;

            case 'setIsBanned':
                setIsBanned();
                break;

            default:
                return;
        }

        // Broadcast message to all connected Users
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

    ws.on('close', () => {
        console.log('disconnected');
    });

    ws.send(Date.now());
});