//  API LOGIC FOR WEATHER MEASUREMENTS

var coll    = require('../collection')
,   debug   = require('debug')('api:weather')
,   moment  = require('moment')
,   _       = require('lodash')
,   VALID_TS_FORMAT = "YYYY-MM-DD HH:mm Z"
,   VALID_DAY_FORMAT = "YYYY-MM-DD"
;

function isValidDate(dateString) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    return dateString.match(regEx) != null;
}

module.exports = {
    addMeasurement: function(req, res, next) {
        var timestamp = req.body.timestamp
        ,   fields = {}
        ,   valid = true
        ;

        _.each(req.body, function(v, key) {
            if(key !== 'timestamp') {
                if(isNaN(parseFloat(v))) {
                    valid = false;
                    return valid;
                }

                // this should "remove" timestamp w/o modifying req.body
                fields[key] = parseFloat(v); // update to float
            }
        })
    
        if(!valid) { // need a flag because lodash loops/awkward "already sent headers"
            return res.sendStatus(400);
        }

        coll.addEntry(timestamp, fields); // returns coll.
        debug(">> collection", coll.toJSON());

        res.append("Location", "/measurements/"+req.body.timestamp);
        res.type('json');
        res.sendStatus(201);
    },

    getMeasurement: function(req, res, next) {
        var ts      = req.params.timestamp
        ,   item
        ;

        debug(">> getMeasurement", moment(ts, VALID_TS_FORMAT).isValid());
        debug(">> getMeasurement", moment(ts, VALID_DAY_FORMAT).isValid());

        //  check the timestamp, if it has the right format, get specifics
        if(moment(ts, VALID_TS_FORMAT).isValid() && ts.indexOf("T") > 0 && ts.indexOf("Z") > 0) {

            item = coll.getByTimestamp(req.params.timestamp);

            if(_.isUndefined(item)) {
                return res.sendStatus(404);
            }

            item = item.toJSON();

        } else if(moment(ts, VALID_DAY_FORMAT).isValid() && isValidDate(ts) ) {
            // map to json already because we're just sending it through
            item = _.map(coll.getAllByDay(ts), function(i) { return i.toJSON() });

        } else {
            // bad request because not valid ts
            // but send 404 instead to be consistent
            return res.sendStatus(404);
        }

        res.type('json');
        return res.json(item);
    }
};