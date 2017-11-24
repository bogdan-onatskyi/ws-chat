const path = require("path");
const express = require('express');
const app = express();

const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const session = require('express-session');
const bodyParser = require('body-parser');

// const setupConnection = require('./db/setup-connection');

const {toString} = require('./utils/utils');

const PORT = 3000;
const PUBLIC_PATH = path.join(__dirname, 'public');

if (process.env.NODE_ENV === 'development') {
    const webpack = require('webpack');
    const webpackConfig = require('./webpack.dev.js');
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

app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: true}));

// const db = setupConnection();

// todo Настроить сессии
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: true}
}));

// function mongoStoreConnectionArgs() {
//     return { dbname: db.db.databaseName,
//         host: db.db.serverConfig.host,
//         port: db.db.serverConfig.port,
//         username: db.uri.username,
//         password: db.uri.password };
// }
//
// app.use(session({
//     store: mongoStore(mongoStoreConnectionArgs())
// }));

const users = [ // todo Заменить на базу данных
    {userName: 'user', password: 'password', isAdmin: true, isBanned: false, isMuted: false, color: 'green'},
    {userName: 'user1', password: 'password1', isAdmin: false, isBanned: false, isMuted: false, color: 'green'},
    {userName: 'user2', password: 'password2', isAdmin: false, isBanned: false, isMuted: false, color: 'green'},
    {userName: 'user3', password: 'password3', isAdmin: false, isBanned: false, isMuted: false, color: 'green'},
];

let isChatServerRunning = false;
const chatHistory = [];
let loggedUsersArray = [];

app.post('/login', function (request, response) {
    const requestData = request.body;

    console.log('');
    console.log(toString('You posted:', requestData));

    let responseData = {
        // userName: '',
        // password: '', isAdmin: false, isBanned: false, isMuted: false, color: 'green',
        auth: 'denied'
    };

    // todo connect to db
    users.forEach(user => {
        if (requestData.userName === user.userName && requestData.password === user.password)
            responseData = {
                userName: user.userName,
                password: user.password,
                isAdmin: user.isAdmin,
                isBanned: user.isBanned,
                isMuted: user.isMuted,
                color: user.color,
                auth: 'ok'
            };
    });

    if (responseData.auth === 'ok') request.session.userName = responseData.userName; // todo auth

    response.setHeader('Content-Type', 'application/json');
    response.send(JSON.stringify(responseData));

    console.log(toString('Server answered:', responseData));

    if (responseData.auth === 'ok' && !isChatServerRunning) {
        const server = http.createServer(app);
        const wss = new WebSocket.Server({server});

        server.listen(8080, () => {
            console.log(`Chat server is listening on ${server.address().port}`);
            isChatServerRunning = true;
        });

        wss.on('connection', ws => {

            ws.on('message', message => {
                console.log(`received chat message: ${message}`);

                let receivedObject = {};

                try {
                    receivedObject = JSON.parse(message);
                } catch (error) {
                    console.log(`JSON.parse error: ${error}`);
                }

                let sentObject = {
                    timeStamp: (new Date()).getTime(),
                    userName: receivedObject.userName,
                };

                switch (receivedObject.type) {
                    case 'initMsg':
                        const user = users.find(u => u.userName === receivedObject.userName);

                        sentObject = {
                            ...sentObject,
                            flag: '144',
                            type: 'initMsg',
                            data: user
                        };
                        ws.send(JSON.stringify(sentObject));

                        return;

                    case 'userMsg':
                        let isUserLogged = false;

                        loggedUsersArray.forEach(user => {
                            if (user.userName && user.userName === receivedObject.userName) {
                                isUserLogged = true;
                            }
                        });

                        if (!isUserLogged || receivedObject.message === null) {

                            sentObject = {
                                ...sentObject,
                                flag: '165',
                                type: 'userEnter',
                                message: `${receivedObject.userName} logged in chat...`
                            };

                            loggedUsersArray.push({
                                userName: receivedObject.userName,
                                ws
                            });
                        }

                        sentObject.flag = '176';
                        sentObject.message = receivedObject.message;

                        console.log(`After enter loggedUsersArray.length = ${loggedUsersArray.length}`);

                        break;

                    case 'userExit':
                        sentObject = {
                            ...sentObject,
                            flag: '182',
                            type: 'userExit',
                            message: `${receivedObject.userName} left chat...`
                        };

                        loggedUsersArray = loggedUsersArray.map(user => {
                            if (user.userName === receivedObject.userName) {
                                // if (user.ws && user.ws.readyState === WebSocket.OPEN) {
                                if (user.ws) {
                                    user.ws.send(JSON.stringify(sentObject));
                                    user.ws.terminate();
                                }
                            }
                            else return user;
                        });

                        console.log(`After exit loggedUsersArray.length = ${loggedUsersArray.length}`);

                        break;
                }

                wss.clients.forEach(client => {
                    // if (client !== ws && client.readyState === WebSocket.OPEN) {
                    if (client.readyState === WebSocket.OPEN) {
                        const message = JSON.stringify(sentObject);
                        client.send(message);
                        console.log(`sent chat message: ${message}`);
                    }
                });
            });
        });
    }
});

// function loadUserFromDB(req, res, next) {
//     if (req.session.user_id) {
//
//
//
//         User.findById(req.session.user_id, function(user) {
//             if (user) {
//                 req.currentUser = user;
//                 next();
//             } else {
//                 res.redirect('/');
//             }
//         });
//     } else {
//         res.redirect('/');
//     }
// }

app.all("/", (request, response) => {
    response.sendFile(path.resolve(PUBLIC_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});