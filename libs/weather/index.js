//  API LOGIC FOR WEATHER MEASUREMENTS

var coll    = require('../collection')
,   debug   = require('debug')('api:weather')
,   _       = require('lodash')
;

module.exports = {
    addMeasurement: function(req, res, next) {
        var fields = req.body;

        coll.addEntry(fields);

        debug(">> collection", coll);

        res.json({});
    }
};