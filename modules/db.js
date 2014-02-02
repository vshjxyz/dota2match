var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/dota2match');

exports.dota2Hero = mongoose.model('dota2Hero', {
    hero_id: Number
    ,name: String
    ,eng_name: String
    ,img_partial_url: String
    ,shown: Boolean
    ,ts_created: {
        type: Date,
        default: Date.now
    }
});