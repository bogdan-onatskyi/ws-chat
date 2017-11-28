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

const arrayOfUsers = [];

arrayOfUsers.push(new User({
    userName: 'User',
    password: 'password',
    isAdmin: true,
    isBanned: false,
    isMuted: false,
    color: 'green',
    token: 'iudfhojslqssfdqsfea'
}));

arrayOfUsers.push(new User({
    userName: 'User1',
    password: 'password1',
    isAdmin: false,
    isBanned: false,
    isMuted: false,
    color: 'green',
    token: 'qwedjlpuhapsfdqsfea'
}));

arrayOfUsers.push(new User({
    userName: 'User2',
    password: 'password2',
    isAdmin: false,
    isBanned: false,
    isMuted: false,
    color: 'green',
    token: 'ipuhjlkjlxapsfdqsfea'
}));

arrayOfUsers.push(new User({
    userName: 'User3',
    password: 'password3',
    isAdmin: false,
    isBanned: false,
    isMuted: false,
    color: 'green',
    token: 'ffdgdfgdqftgfdgrfsfea'
}));

arrayOfUsers.push(new User({
    userName: 'User4',
    password: 'password4',
    isAdmin: false,
    isBanned: false,
    isMuted: false,
    color: 'green',
    token: 'tgafaqweweeifdgrfsfea'
}));

arrayOfUsers.forEach(user => {
    user.save(err => {
        mongoose.disconnect();
        if(err) return console.log(err);
        console.log("Сохранен объект", user);
    });
});