const path = require("path");

const session = require('express-session');
const express = require('express');
const app = express();

const WebSocket = require('ws');

const http = require('http');
const uuid = require('uuid');

const bodyParser = require('body-parser');

const {toString} = require('../utils/utils');

const generateToken = () => {
    return uuid.v4();
};

const mongoose = require("mongoose");
mongoose.Promise = global.Promise;
const userSchema = mongoose.Schema({
    userName: String,
    password: String,
    token: String,

    isAdmin: Boolean,
    isBanned: Boolean,
    isMuted: Boolean,

    color: String
});
mongoose.connect('mongodb://localhost:27017/chat', {
    useMongoClient: true,
});
const db = mongoose.connection;
const User = mongoose.model("User", userSchema);

let loggedUsersArray = [];

adminColor = '#8A1631';
const userColors = [
    '#A6206C', '#167764', '#0B4571', '#49296A', '#4E2114', '#444247'
];
const getUserColor = () => userColors[Math.random() * userColors.length ^ 0];

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
    const {userName, password} = requestData;

    console.log('');
    console.log(toString('You posted:', requestData));

    let responseData = {
        token: '',
        auth: 'Access denied'
    };

    User.findOne({userName, password})
        .then(user => {
            if (!user) { // todo создание СРАЗУ нового пользователя
                return User.create(
                    {
                        userName,
                        password,
                        isAdmin: false,
                        isBanned: false,
                        isMuted: false,
                        color: getUserColor(),
                        token: generateToken(),
                        auth: 'ok'
                    })
                    .then(user => {
                        return user;
                    })
                    .catch(err => {
                        console.log(`Error: ${err}`);
                    });

            } else
                return user;
        })
        .then(user => {
            const {isAdmin, isBanned, isMuted, color, token} = user;

            if (isBanned) {
                responseData = {
                    userName, password, isAdmin, isBanned, isMuted, color, token,
                    auth: `${userName} is banned by Admin`
                };
            } else {
                responseData = {
                    userName, password, isAdmin, isBanned, isMuted, color, token,
                    auth: 'ok'
                };
            }

            const id = uuid.v4();
            console.log(`Updating session for user ${id}`);

            request.session.userId = id;
            request.session.token = responseData.token;

            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify(responseData));

            console.log(toString('Server answered:', responseData));
        })
        .catch(err => {
            console.log(`Error: ${err}`);
        });
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

        sessionParser(info.req, {}, () => {

            // We can reject the connection by returning false to done().
            // For example, reject here if user is unknown.

            const token = info.req.session.token;

            User.findOne({token})
                .then(user => {
                    if (user) {
                        done(info.req.session.token);
                    } else {
                        console.log('Websocket refused your connection...');
                        done(false, 401, 'Websocket refused your connection...'); // todo Не работает
                    }
                })
                .catch(err => {
                    console.log(`Error: ${err}`);
                });
        });
    },
    server
});

wss.on('connection', (ws, request) => {

    let connectionName = ''; // connectionName === userName

    const sendResponseBroadcast = responseObject => {
        wss.clients.forEach(client => {
            // if (client !== ws && client.readyState === WebSocket.OPEN) {
            if (client.readyState === WebSocket.OPEN) {
                const message = JSON.stringify(responseObject);

                client.send(message);

                if (process.env.NODE_ENV === 'development') {
                    console.log(`sent chat message: ${message}`);
                }
            }
        });
    };

    const userExit = (ws) => {
        const userName = connectionName;

        loggedUsersArray = loggedUsersArray.filter(user => user.ws !== ws);

        const responseObject = {
            type: 'responseUserExit',
            timeStamp: Date.now(),
            userName,
            message: `Chat message: ${userName} left chat...`
        };

        ws.close();

        sendResponseBroadcast(responseObject);
    };

    ws.on('message', (message) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`Received chat message: ${message}`);
        }

        let requestObject = {};
        try {
            requestObject = JSON.parse(message);
        } catch (err) {
            console.log(`JSON.parse error: ${err}`);
            return;
        }

        const {userName} = requestObject;

        const sendResponse = responseObject => {
            if (ws.readyState === WebSocket.OPEN) {
                const message = JSON.stringify(responseObject);

                ws.send(message);

                if (process.env.NODE_ENV === 'development') {
                    console.log(`sent chat message: ${message}`);
                }
            }
        };

        const getUserInfo = () => {
            User.findOne({userName})
                .then(user => {
                    const responseObject = {
                        type: 'responseGetUserInfo',
                        timeStamp: Date.now(),
                        userName,
                        data: user
                    };

                    sendResponse(responseObject);

                    connectionName = userName;
                })
                .catch(err => {
                    console.log(err);
                });
        };

        const getOnlineUsersList = () => {
            User.find({})
                .then(users => {
                    loggedUsersArray.forEach(loggedUser => {
                        users.forEach(user => {
                            if (loggedUser.userName === user.userName) {

                                loggedUser.isBanned = user.isBanned;
                                loggedUser.isMuted = user.isMuted;
                                loggedUser.color = user.color;
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

                    const responseObject = {
                        type: 'responseGetOnlineUsersList',
                        timeStamp: Date.now(),
                        userName,
                        data: array
                    };

                    sendResponse(responseObject);
                })
                .catch(err => {
                    console.log(err);
                });
        };

        const getBannedUsersList = () => {
            User.find({isBanned: true})
                .then(users => {
                    const array = [];

                    users.forEach(user => {
                        const {userName, isAdmin, isBanned, isMuted, color} = user;
                        array.push({
                            userName, isAdmin, isBanned, isMuted, color
                        });
                    });

                    array.sort((a, b) => {
                        if (a.userName > b.userName) return 1;
                        if (a.userName < b.userName) return -1;
                    });

                    const responseObject = {
                        type: 'responseGetBannedUsersList',
                        timeStamp: Date.now(),
                        userName,
                        data: array
                    };

                    sendResponse(responseObject);
                })
                .catch(err => {
                    console.log(err);
                });
        };

        const getAllUsersList = () => {
            User.find({})
                .then(users => {
                    const array = [];

                    users.forEach(user => {
                        const {userName, isAdmin, isBanned, isMuted, color} = user;
                        array.push({
                            userName, isAdmin, isBanned, isMuted, color
                        });
                    });

                    array.sort((a, b) => {
                        if (a.userName > b.userName) return 1;
                        if (a.userName < b.userName) return -1;
                    });

                    const responseObject = {
                        type: 'responseGetAllUsersList',
                        timeStamp: Date.now(),
                        userName,
                        data: array
                    };

                    sendResponse(responseObject);
                })
                .catch(err => {
                    console.log(err);
                });
        };

        const newUser = () => {
            User.findOne({userName})
                .then(user => {
                    const {isAdmin, isBanned, isMuted, color} = user;

                    loggedUsersArray.push({
                        userName, isAdmin, isBanned, isMuted, color,
                        ws
                    });

                    const responseObject = {
                        type: 'responseNewUser',
                        timeStamp: Date.now(),
                        userName,
                        message: `Chat message: ${userName} logged in chat...`
                    };

                    sendResponseBroadcast(responseObject);
                })
                .catch(err => {
                    console.log(err);
                });
        };

        const newMessage = () => {
            const responseObject = {
                type: 'responseNewMessage',
                timeStamp: Date.now(),
                userName,
                message: requestObject.message,
                color: requestObject.color
            };

            sendResponseBroadcast(responseObject);
        };

        const setIsMuted = () => {
            User.findOne({userName})
                .then(user => {
                    user.isMuted = requestObject.isMuted;
                    user.save()
                        .then(saved => {
                            const text = requestObject.isMuted ? '' : 'un';
                            const responseObject = {
                                type: 'responseSetIsMuted',
                                timeStamp: Date.now(),
                                userName,
                                message: `Chat message: ${userName} is ${text}muted...`
                            };

                            sendResponseBroadcast(responseObject);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                })
                .catch(err => {
                    console.log(err);
                });
        };

        const setIsBanned = () => {
            User.findOne({userName})
                .then(user => {
                    user.isBanned = requestObject.isBanned;
                    user.save()
                        .then(saved => {
                            const text = requestObject.isBanned ? '' : 'un';
                            const responseObject = {
                                type: 'responseSetIsBanned',
                                timeStamp: Date.now(),
                                userName,
                                message: `Chat message: ${userName} is ${text}banned...`
                            };

                            sendResponseBroadcast(responseObject);
                        })
                        .catch(err => {
                            console.log(err);
                        });
                })
                .catch(err => {
                    console.log(err);
                });
        };

        switch (requestObject.type) {
            case 'getUserInfo':
                getUserInfo();
                return;

            case 'getOnlineUsersList':
                getOnlineUsersList();
                return;

            case 'getBannedUsersList':
                getBannedUsersList();
                return;

            case 'getAllUsersList':
                getAllUsersList();
                return;

            case 'newUser':
                newUser();
                return;

            case 'newMessage':
                newMessage();
                return;

            case 'userExit':
                userExit(ws);
                return;

            case 'setIsMuted':
                setIsMuted();
                return;

            case 'setIsBanned':
                setIsBanned();
                return;

            default:
                return;
        }
    });

    ws.on('close', () => {
        userExit(ws);
        console.log('disconnected');
    });
});

server.listen(8080, () => console.log('Websocket server is listening on http://localhost:8080'));