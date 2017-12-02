const uuid = require('uuid');

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
const User = mongoose.model("User", userSchema);

const generateToken = () => {
    return uuid.v4();
};

const adminColor = '#8A1631';
const userColors = [
    '#167764',
    '#0B4571',
    '#4E2114',
    '#49296A',
    '#A6206C',
    '#444247'
];
const getUserColor = index => {
    if (index === undefined)
        return userColors[Math.random() * userColors.length ^ 0];

    return userColors[index];
};

const initData = () => {

    const arrayOfUsers = [];

    arrayOfUsers.push(new User({
        userName: 'user',
        password: 'password',
        isAdmin: true,
        isBanned: false,
        isMuted: false,
        color: adminColor,
        token: generateToken()
    }));

    arrayOfUsers.push(new User({
        userName: 'user1',
        password: 'password1',
        isAdmin: false,
        isBanned: false,
        isMuted: false,
        color: getUserColor(0),
        token: generateToken()
    }));

    arrayOfUsers.push(new User({
        userName: 'user2',
        password: 'password2',
        isAdmin: false,
        isBanned: false,
        isMuted: false,
        color: getUserColor(1),
        token: generateToken()
    }));

    arrayOfUsers.push(new User({
        userName: 'user3',
        password: 'password3',
        isAdmin: false,
        isBanned: false,
        isMuted: false,
        color: getUserColor(2),
        token: generateToken()
    }));

    arrayOfUsers.push(new User({
        userName: 'user4',
        password: 'password4',
        isAdmin: false,
        isBanned: false,
        isMuted: false,
        color: getUserColor(3),
        token: generateToken()
    }));

    arrayOfUsers.forEach(user => {
        user.save(err => {
            // mongoose.disconnect();
            if (err) return console.log(err);
            console.log("Сохранен объект", user);
        });
    });
    // mongoose.disconnect();
};

initData();