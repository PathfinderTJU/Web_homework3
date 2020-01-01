//配置mongoose的配置信息

const mongoose = require('mongoose');
const config = require('./config');
module.exports = () => {
    mongoose.connect(config.mongodb);
    var db = mongoose.connection;
    db.on('error', console.error.bind(console, "mongodb connection error"));
    db.once('open', function(callback) {
        console.log("mongodb connected successfully.");
    })

    return db;
}