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
let loggedUsers = [];

app.post('/login', function (req, res) {
    const reqData = req.body;

    console.log('');
    console.log(toString('You posted:', reqData));

    let resData = {
        userName: '', password: '', isAdmin: false, isBanned: false, isMuted: false, color: 'green',
        auth: 'denied'
    };

    // todo connect to db
    users.forEach(user => {
        if (reqData.userName === user.userName && reqData.password === user.password)
            resData = {
                userName: user.userName,
                password: user.password,
                isAdmin: user.isAdmin,
                isBanned: user.isBanned,
                isMuted: user.isMuted,
                color: user.color,
                auth: 'ok'
            };
    });

    req.session.userName = resData.userName; // todo auth

    if (resData.auth === 'ok' && !isChatServerRunning) {
        const server = http.createServer(app);
        const wss = new WebSocket.Server({server});

        server.listen(8080, () => {
            console.log(`Chat server is listening on ${server.address().port}`);
            isChatServerRunning = true;
        });

        wss.on('connection', ws => {

            ws.on('message', message => {
                console.log(`received chat message: ${message}`);

                let obj;
                try {
                    obj = JSON.parse(message);
                } catch (err) {
                    console.log(`JSON.parse error: ${err}`);
                }

                obj.timeStamp = (new Date()).getTime();

                switch (obj.type) {
                    case 'initMsg':
                        const user = users.find(u => u.userName === obj.userName);

                        ws.send(JSON.stringify({type: 'initMsg', data: user}));
                        return;

                    case 'userMsg':
                        let isLogged = false;
                        loggedUsers.forEach(user => {
                            if (user.userName === obj.userName) {
                                isLogged = true;
                            }
                        });

                        if (!isLogged || obj.message === null) {
                            obj.type = 'serverMsg';
                            obj.message = `${obj.userName} logged in chat...`;
                            loggedUsers.push({
                                userName: obj.userName,
                                ws
                            });
                        }
                        break;

                    case 'userExit':
                        loggedUsers = loggedUsers.filter(user => user.userName !== obj.userName);

                        obj.type = 'serverMsg';
                        obj.message = `${obj.userName} left chat...`;

                        loggedUsers.forEach(user => {
                            if (user.userName === obj.userName) user.ws.terminate();
                        });
                        break;
                }

                wss.clients.forEach(client => {
                    // if (client !== ws && client.readyState === WebSocket.OPEN) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify(obj));
                        console.log(`sent chat message: ${JSON.stringify(obj)}`);
                    }
                });
            });

            // ws.on('close', message => { // todo Close connection
            //
            // });
        });
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(resData));

    console.log(toString('Server answered:', resData));
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
//
// app.get('/chat', loadUserFromDB, function(req, res) {
//     console.log('/chat');
// });

app.all("/", (req, res) => {
    res.sendFile(path.resolve(PUBLIC_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});