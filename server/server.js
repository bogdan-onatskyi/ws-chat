const path = require("path");
const express = require('express');
const app = express();

const bodyParser = require('body-parser');

const {toString, generateToken} = require('../utils/utils');
const Users = require('./users').Users;

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

app.post('/login', (request, response) => {
    const requestData = request.body;

    console.log('');
    console.log(toString('You posted:', requestData));

    let responseData = {
        auth: 'Access denied'
    };

    Users.forEach(user => {
        if (requestData.userName === user.userName && requestData.password === user.password) {

            responseData = user.isBanned
                ? {
                    auth: 'Access denied: you are banned by admin.'
                }
                : {
                    userName: user.userName,
                    // password: user.password,
                    isAdmin: user.isAdmin,
                    isBanned: user.isBanned,
                    isMuted: user.isMuted,
                    color: user.color,
                    token: user.token,
                    auth: 'ok'
                };
        }
    });

    if (responseData.auth === 'Access denied') {
        Users.push({
            userName: requestData.userName,
            // password: requestData.password,
            isAdmin: false,
            isBanned: false,
            isMuted: false,
            color: 'green',
            token: generateToken(),
            auth: 'ok'
        });
    }

    response.setHeader('Content-Type', 'application/json');
    response.send(JSON.stringify(responseData));

    console.log(toString('Server answered:', responseData));
});

app.all("/", (request, response) => {
    response.sendFile(path.resolve(PUBLIC_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
});