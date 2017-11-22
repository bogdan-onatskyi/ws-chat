const path = require("path");
const express = require('express');

const http = require('http');
const url = require('url');
const WebSocket = require('ws');

const session = require('express-session');
const bodyParser = require('body-parser');

// const setupConnection = require('./db/setup-connection');

const {toString} = require('./utils/utils');

const PORT = 3000;
const PUBLIC_PATH = path.join(__dirname, 'public');

const app = express();

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

const users = [
    {userName: 'user', password: 'password'},
    {userName: 'user1', password: 'password1'},
    {userName: 'user2', password: 'password2'},
    {userName: 'user3', password: 'password3'},
];

const loggedUsers = [];

const chatHistory = [];

app.post('/login', function (req, res) {
    const reqData = req.body;

    console.log('');
    console.log(toString('You posted:', reqData));

    let retData = {
        userName: '',
        password: '',
        auth: 'denied'
    };

    // todo connect to db
    users.forEach(user => {
        if (reqData.userName === user.userName && reqData.password === user.password) {
            retData = {
                userName: user.userName,
                password: user.password,
                auth: 'ok'
            };
        }
    });

    req.session.userName = retData.userName;
    console.log(`req.session.userName = ${req.session.userName}`);

    if (retData.auth === 'ok') {
        if (loggedUsers.length === 0) { // todo Запустить ws-server
            console.log('Запустить ws-server...');


            const server = http.createServer(app);
            const wss = new WebSocket.Server({server});

            wss.on('connection', function connection(ws, req) {
                const location = url.parse(req.url, true);
                // You might use location.query.access_token to authenticate or share sessions
                // or req.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

                ws.on('message', function incoming(message) {
                    console.log(`received: ${message}`);

                    let obj;
                    try {
                        obj = JSON.parse(message);
                    } catch (err) {
                        console.log(`JSON.parse error: ${err}`);
                    }

                    obj.timeStamp = (new Date()).getTime();

                    chatHistory.push(obj);
                    ws.send(JSON.stringify(chatHistory));
                });
            });

            server.listen(8080, function listening() {
                console.log('Listening on %d', server.address().port);
            });
        }

        // loggedUsers.push({
        //     userName: retData.userName // todo Добавить остальную информацию о пользователе
        // });
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(retData));

    console.log(toString('Server answered:', retData));
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

app.all("/", function (req, res) {
    res.sendFile(path.resolve(PUBLIC_PATH, 'index.html'));
});

app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}...`);
});