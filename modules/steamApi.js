var req = require('./getJson')
    ,db = require('./db')
    ,fs = require('fs')
    ,Q = require('q')
    ,http = require('http-get')
    ;

exports.syncDota2Heroes = function (language) {
    var deferred = Q.defer();
    // Drops an error if the language is none of the expected
    if (['en_us'].indexOf(language) === -1) {
        deferred.reject('You must specify a valid language parameter to sync the heroes!');
    } else {
        // Performs the AJAX call with the API key
        req.getJSON({
            host: 'api.steampowered.com'
            ,path: '/IEconDOTA2_570/GetHeroes/v0001/?key=8DC022061B9B634134F0196A61A46ED5&language=' + language
            ,port: 80
            ,method: 'GET'
            ,headers: {
                'Content-Type': 'application/json'
            }
        }, function (statusCode, response) {
            if (statusCode === 200) {
                var heroes = response.result.heroes.map(function (item) {
                    // Removing the npc_dota_hero_ prefix
                    var clean_name = item.name.slice(14);
                    return {
                        hero_id: item.id
                        ,name: item.name
                        ,eng_name: item.localized_name
                        ,shown: true
                        ,img_partial_url: 'http://media.steampowered.com/apps/dota2/images/heroes/' + clean_name
                    };
                });

                db.dota2Hero.count({}, function(err, count){
                    if (count < heroes.length) {
                        console.log('Removing all the heroes from the database');
                        db.dota2Hero.remove({}, function (err) {
                            if (err) {
                                deferred.reject('Error during the heroes sync (remove)');
                            } else {
                                console.log('Creating the new heroes document on the database');
                                db.dota2Hero.create(heroes, function (err) {
                                    if (err) {
                                        deferred.reject('Error during the heroes sync (insert)');
                                    } else {
                                        console.log('Synched ' + heroes.length + ' heroes');
                                        deferred.resolve();
                                    }
                                });
                            }
                        });
                    } else {
                        console.log('There are no new heroes, skipping the sync');
                        deferred.resolve();
                    }
                });
            }
        });
    }
    return deferred.promise;
};

exports.syncDota2HeroesImages = function (option) {
    // Drops an error if the image format is none of the expected
    if (['lg'].indexOf(option) === -1) {
        console.error('You must specify a valid image size to sync the heroes!');
        return;
    }

    // Cycles through every hero on the database and downloads his picture if it's not there
    db.dota2Hero.find().exec(function(err, collection) {
        if (collection.length > 0) {
            var downloadImage = function (index) {
                var hero = collection[index];
                var imgPath = __dirname + '/../public/images/heroes/' + hero.name + '.png';
                if (!fs.existsSync(imgPath)) {
                    console.log('Downloading image for the hero: ' + hero.eng_name);
                    // Performing the real download
                    http.get(hero.img_partial_url + '_' + option + '.png', imgPath, function (err, result) {
                        if (err) {
                            console.error('Error during the download of the image for the hero: ' + hero.eng_name);
                        } else {
                            downloadImage(index + 1);
                        }
                    });

                } else {
                    console.log('The image for the hero "' + hero.eng_name + '" is already there');
                    downloadImage(index + 1);
                }
            };
            downloadImage(0);
        } else {
            console.log('There are no heroes on the database');
        }
    });
};