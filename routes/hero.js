var db = require('../modules/db');

exports.findById = function(req, res) {
};

exports.findAll = function(req, res) {
    db.dota2Hero.find().exec(function(err, collection) {
        res.send(collection);
    });
};
