const path = require("path");
const express = require('express');
const app = express();

// const http = require('http');
// const url = require('url');
// const WebSocket = require('ws');

const session = require('express-session');
const bodyParser = require('body-parser');

// const setupConnection = require('./db/setup-connection');

const {toString} = require('../utils/utils');

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

// let isChatServerRunning = false;
// const chatHistory = [];
// let loggedUsersArray = [];

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
//
// app.get('/chat', loadUserFromDB, function(req, res) {
//     console.log('/chat');
// });

app.all("/", (request, response) => {
    response.sendFile(path.resolve(PUBLIC_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});