//  API LOGIC FOR WEATHER MEASUREMENTS

var coll    = require('../collection')
,   debug   = require('debug')('api:weather')
,   _       = require('lodash')
;

module.exports = {
    addMeasurement: function(req, res, next) {
        var timestamp = req.body.timestamp
        ,   fields = {}
        ,   valid = true
        ;

        _.each(req.body, function(v, key) {
            if(key !== 'timestamp' && isNaN(parseFloat(v))) {
                valid = false;
                return valid;
            }

            // this should "remove" timestamp w/o modifying req.body
            fields[key] = parseFloat(v); // update to float
        })
    

        if(!valid) { // need a flag because lodash loops/awkward "already sent headers"
            return res.sendStatus(400);
        }

        coll.addEntry(timestamp, fields); // returns coll.
        debug(">> collection", coll.toJSON());

        res.append("Location", "/measurements/"+fields.timestamp);
        res.type('json');
        res.sendStatus(201);
    }
};