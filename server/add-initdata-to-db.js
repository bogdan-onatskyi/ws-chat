const uuid = require('uuid');

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
const User = mongoose.model("User", userSchema);

const initData = () => {

    const arrayOfUsers = [];

    arrayOfUsers.push(new User({
        userName: 'user',
        password: 'password',
        isAdmin: true,
        isBanned: false,
        isMuted: false,
        color: 'green',
        token: generateToken()
    }));

    arrayOfUsers.push(new User({
        userName: 'user1',
        password: 'password1',
        isAdmin: false,
        isBanned: false,
        isMuted: false,
        color: 'green',
        token: generateToken()
    }));

    arrayOfUsers.push(new User({
        userName: 'user2',
        password: 'password2',
        isAdmin: false,
        isBanned: false,
        isMuted: false,
        color: 'green',
        token: generateToken()
    }));

    arrayOfUsers.push(new User({
        userName: 'user3',
        password: 'password3',
        isAdmin: false,
        isBanned: false,
        isMuted: false,
        color: 'green',
        token: generateToken()
    }));

    arrayOfUsers.push(new User({
        userName: 'user4',
        password: 'password4',
        isAdmin: false,
        isBanned: false,
        isMuted: false,
        color: 'green',
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

// User.find({}, (err, users) => {
//     console.log(` = ${users}`);
//     users.forEach(user => {
//         console.log(`user.userName = ${user.userName}, user.isAdmin = ${user.isAdmin}`);
//     });
//     return 1;
// });

// User.find({})
//     .then(users => {
//         console.log(`users = ${users}`);
//         users.forEach(user => {
//             console.log(`user.userName = ${user.userName}, user.isAdmin = ${user.isAdmin}`);
//         });
//     })
//     .catch(err => {
//         console.log(`err = ${err}`);
//     });

// const user = User.findOne({token: 'iudfhojslqssfdqsfea'})
//     .then(user => {
//         console.log(`107: ${user.isBanned} ${user.isAdmin}, ${user.token}`);
//         return user;
//     })
//     .then(user1 => {
//         console.log(`user1 = ${user1}`);
//     })
//     .catch(err => {
//         console.log(`108: Error: ${err}`);
//     });
// console.log(`109: ${user.isBanned} ${user.isAdmin}, ${user.token}`);


// User.findOne({userName: "user", password: "password"}, (err, user) => {
//     // mongoose.disconnect();
//
//     if (err) return console.log(err);
//
//     console.log(`120: Найдено: ${user}`);
// });

// User.find({})
//     .then(users => {
//         users.forEach(user => {
//             console.log(`user.userName = ${user.userName}`);
//         })
//     });

// const users = async () => {
//     const user = await User.findOne({userName: 'user'});
//     const user1 = await User.findOne({userName: 'user111'});
//
//     console.log(`user = ${user}, \n user1 = ${user1}`);
//     return 'all users';
// };
//
// console.log(`users() = ${users()}`);

// const autorize = async () => {
//
//     const user = await User.findOne({userName: 'user', password: 'password'})
//         .catch(err => {
//             console.log(`125: Error: ${err}`);
//         });
//     console.log(`108: ${user.isBanned} ${user.isAdmin}, ${user.token}`);
//
//     const {userName, isAdmin, isBanned, isMuted, color, token} = user;
//
//     let responseData = user.isBanned
//         ? {auth: 'Access denied: you are banned by admin.'} // todo что делать с session
//         : {userName, isAdmin, isBanned, isMuted, color, token, auth: 'ok'};
//
//     if (responseData.auth === 'Access denied') { // todo создание СРАЗУ нового пользователя
//         responseData = {
//             userName: 'user',
//             password: 'password',
//             // userName: requestData.userName,
//             // password: requestData.password,
//             isAdmin: false,
//             isBanned: false,
//             isMuted: false,
//             color: 'green',
//             token: 'fake token',
//             // token: generateToken(),
//             auth: 'ok'
//         };
//
//         const {userName, isAdmin, isBanned, isMuted, color, token} = responseData;
//
//         const newUser = await User.create({userName, isAdmin, isBanned, isMuted, color, token});
//         console.log("Сохранен пользователь:", newUser);
//         //
//         // , (err, user) => {
//         //     // mongoose.disconnect();
//         //
//         //     if (err) return console.log(err);
//         //
//         //     console.log("Сохранен пользователь:", user);
//         // });
//     }
//
//     const user1 = await User.findOne({userName: 'user1'});
//     console.log(`163: ${user1.isBanned} ${user1.isAdmin}, ${user1.token}`);
//
//     // return responseData.auth;
//     mongoose.disconnect();
// };
// try {
//     const done = autorize();
//     console.log(`done = ${done}`);
// }
// catch (err) {
//     console.log(`Error: ${err}`);
// }