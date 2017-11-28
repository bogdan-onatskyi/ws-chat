const path = require("path");

const session = require('express-session');
const express = require('express');
const app = express();

const WebSocket = require('ws');

const http = require('http');
const uuid = require('uuid');

const bodyParser = require('body-parser');

const {toString, generateToken} = require('../utils/utils');
const Users = require('./users').Users;
let loggedUsersArray = [];

// We need the same instance of the session parser in express and  WebSocket server.
const sessionParser = session({
    saveUninitialized: false,
    secret: '$eCuRiTy',
    resave: false
});

const PORT = 3000;
const PUBLIC_PATH = path.join(__dirname, 'public');

if (process.env.NODE_ENV === 'development') {
    const webpack = require('webpack');
    const webpackConfig = require('../webpack.dev.js');

    const compiler = webpack(webpackConfig);

    app.use(require('webpack-dev-middleware')(compiler, {
        hot: true,
        stats: {
            colors: true
        },
        watchOptions: {
            aggregateTimeout: 0,
            poll: true
        },
        publicPath: webpackConfig.output.publicPath
    }));
    app.use(require('webpack-hot-middleware')(compiler));
}
else {
    app.use(express.static(PUBLIC_PATH));
}

app.use(sessionParser);
app.use(bodyParser.json());

app.post('/login', (request, response) => {
    const requestData = request.body;

    console.log('');
    console.log(toString('You posted:', requestData));

    let responseData = {
        token: '',
        auth: 'Access denied'
    };

    // todo db
    Users.forEach(user => {
        if (requestData.userName === user.userName && requestData.password === user.password) {

            responseData = user.isBanned
                ? {
                    auth: 'Access denied: you are banned by admin.' // todo что делать с session
                }
                : {
                    userName: user.userName,
                    isAdmin: user.isAdmin,
                    isBanned: user.isBanned,
                    isMuted: user.isMuted,
                    color: user.color,
                    token: user.token,
                    auth: 'ok'
                };
        }
    });

    if (responseData.auth === 'Access denied') { // todo создание сразу нового пользователя
        responseData = {
            userName: requestData.userName,
            password: requestData.password,
            isAdmin: false,
            isBanned: false,
            isMuted: false,
            color: 'green',
            token: generateToken(),
            auth: 'ok'
        };

        // todo db
        const {userName, isAdmin, isBanned, isMuted, color, token} = responseData;

        Users.push({userName, isAdmin, isBanned, isMuted, color, token})
    }

    // "Log in" user and set userId to session.
    const id = uuid.v4();

    console.log(`Updating session for user ${id}`);
    request.session.userId = id;
    request.session.token = responseData.token;

    response.setHeader('Content-Type', 'application/json');
    response.send(JSON.stringify(responseData));

    console.log(toString('Server answered:', responseData));
});

app.delete('/logout', (request, response) => { // todo На выход из чата
    console.log('Destroying session');
    request.session.destroy();
    response.send({result: 'OK', message: 'Session destroyed'});
});

app.all("/", (request, response) => {
    response.sendFile(path.resolve(PUBLIC_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`App server is listening on port ${PORT}...`);
});


// Websocket server

// ипользуя Express
// const server = http.createServer(app);

// не ипользуя Express
const server = http.createServer((request, response) => {
    // Not important for us. We're writing WebSocket server,
    // not HTTP server
});

const wss = new WebSocket.Server({
    verifyClient: (info, done) => {

        console.log('Parsing session from request...');
        sessionParser(info.req, {}, () => {
            console.log('Session is parsed!');

            // We can reject the connection by returning false to done().
            // For example, reject here if user is unknown.

            const token = info.req.session.token;

            if (token === '' || token === 'fake token')
            {
                console.log('Websocket refused your connection...');
                done(false, 401, 'Websocket refused your connection...');
            }
            else
            {
                console.log(`info.req.session.token`);
                done(info.req.session.token);
            }
        });
    },
    server
});

wss.on('connection', (ws, request) => {
    ws.on('message', (message) => {
        //
        // Here we can now use session parameters.
        //
        console.log(`WS message ${message} from user ${request.session.userId}, token=${request.session.token}`);

        // Users.forEach(user => {
        //     console.log(`userName = ${user.userName}, token = ${user.token}`);
        // });

        if (process.env.NODE_ENV === 'development') {
            console.log(`Received chat message: ${message} from user ${request.session.userId}, token=${request.session.token}`);
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

        const setIsBanned = () => { // todo неправильно работает
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

});

server.listen(8080, () => console.log('Websocket server is listening on http://localhost:8080'));