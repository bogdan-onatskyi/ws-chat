const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const config = require('../config.json');
const {host, port, name} = config.db;

module.exports = () => {
    mongoose.connect(`mongodb://${host}:${port}/${name}`, {
        useMongoClient: true,
    })
    mongoose.connect(`mongodb://${host}:${port}/${name}`)
        .catch(err => console.log(`Database connection Error ${err}`));
};