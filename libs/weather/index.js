//  API LOGIC FOR WEATHER MEASUREMENTS

var coll    = require('../collection')
,   debug   = require('debug')('api:weather')
,   moment  = require('moment')
,   _       = require('lodash')
,   VALID_TS_FORMAT = "YYYY-MM-DD HH:mm Z"
,   VALID_DAY_FORMAT = "YYYY-MM-DD"
;

// FOR QUICK & DIRTY TESTING

coll.addEntry("2015-09-01T16:00:00.000Z", { 'temperature': '11.2', 'dewPoint': '16.7', 'precipitation': 0 });
coll.addEntry("2015-09-01T16:00:00.001Z", { 'temperature': '11.2', 'dewPoint': '16.7', 'precipitation': 1 });
coll.addEntry("2015-09-01T16:00:00.002Z", { 'temperature': '11.2', 'dewPoint': '16.7', 'precipitation': 2 });
coll.addEntry("2015-09-01T16:00:00.003Z", { 'temperature': '11.2', 'dewPoint': '16.7', 'precipitation': 3 });

//  ========== ROUTE LOGIC

module.exports = {
    addMeasurement: function(req, res, next) {
        var timestamp = req.body.timestamp
        ,   validated = validateBody(req.body)
        ;
    
        if(!validated.is_valid) { // need a flag because lodash loops/awkward "already sent headers"
            return res.sendStatus(400);
        }

        coll.addEntry(timestamp, validated.parsed_body); // returns coll.
        debug(">> collection", coll.toJSON());

        res.append("Location", "/measurements/"+req.body.timestamp);
        res.type('json');
        res.sendStatus(201);
    },

    getMeasurement: function(req, res, next) {
        var ts = req.params.timestamp
        ,   item
        ;

        debug(">> getMeasurement", moment(ts, VALID_TS_FORMAT).isValid());
        debug(">> getMeasurement", moment(ts, VALID_DAY_FORMAT).isValid());

        //  check the timestamp, if it has the right format, get specifics
        //  Let's just check the string for the pieces
        if(isValidTimestamp(ts)) {

            item = coll.getByTimestamp(req.params.timestamp);

            if(_.isUndefined(item)) {
                return res.sendStatus(404);
            }

            item = item.toJSON();

        // if valid date (first off) and then YYYY-MM-DD format
        } else if(isValidDate(ts) ) {
            // map to json already because we're just sending it through
            item = _.map(coll.getAllByDay(ts), function(i) { return i.toJSON() });

            if(item.length <= 0) {
                return res.sendStatus(404);
            }

        } else {
            // bad request because not valid ts
            // FIXME: but send 404 instead to be consistent?
            return res.sendStatus(404);
        }

        res.type('json');
        return res.json(item);
    },

    updateMeasurement: function(req, res, next) {
        var ts        = req.params.timestamp
        ,   ts_body   = req.body.timestamp
        ,   validated = validateBody(req.body)
        ;

        if(!coll.timestampExists(ts)) {
            return res.sendStatus(404);
        }

        if(!ts && !ts_body) {
            return res.sendStatus(400); // need both timestamps
        }

        if(!isValidTimestamp(ts) || !isValidTimestamp(ts_body)) {
            return res.sendStatus(404);
        }

        if( ts !== ts_body) { // FIXME: maybe compare MOMENT?
            return res.sendStatus(409);
        }

        // now validate the rest of the body...
        if(!validated.is_valid) {
            return res.sendStatus(400);
        }

        if(!coll.updateByTimestamp(ts, validated.parsed_body)) {
            return res.sendStatus(404); // dne
        }

        return res.sendStatus(204);
    }
};


//  ========== HELPER FUNCTIONS

function isValidDate(dateStr) {
    var regEx = /^\d{4}-\d{2}-\d{2}$/;
    return dateStr.match(regEx) != null && moment(dateStr, VALID_DAY_FORMAT).isValid();
}

function isValidTimestamp(ts) {
    return (moment(ts, VALID_TS_FORMAT).isValid() && ts.indexOf("T") > 0 && ts.indexOf("Z") > 0);
}

function validateBody(body) {
    var fields = {}
    ,   valid = true
    ;

    _.each(body, function(v, key) {
        if(key !== 'timestamp') {
            if(isNaN(parseFloat(v))) {
                valid = false;
                return valid;
            }

            // this should "remove" timestamp w/o modifying req.body
            fields[key] = parseFloat(v); // update to float
        }
    })

    return {
        'is_valid': valid,
        'parsed_body': fields
    }
}
