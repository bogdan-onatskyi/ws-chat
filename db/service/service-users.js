const Users = require('../models/users');

exports.getAllUsers = () => {
    return Users.find();
};

exports.addUser = data => {
    const user = new Users({...data});

    return user.save();
};

exports.findUserByPassword = password => {
    Users.findOne({'password': password}, 'userName', (err, userName) => {
        return err ? false : userName
    })
};

exports.deleteUser = id => {
    return Users.findById(id).remove();
};
