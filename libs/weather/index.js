//  API LOGIC FOR WEATHER MEASUREMENTS

var coll    = require('../collection')
,   debug   = require('debug')('api:weather')
,   moment  = require('moment')
,   _       = require('lodash')
,   VALID_TS_FORMAT = "YYYY-MM-DD HH:mm Z"
,   VALID_DAY_FORMAT = "YYYY-MM-DD"
;

// FOR QUICK & DIRTY TESTING

coll.addEntry("2015-09-01T16:00:00.000Z", validateBody({ 'temperature': '27.1', 'dewPoint': '16.9' }).parsed_body);
coll.addEntry("2015-09-01T16:10:00.000Z", validateBody({ 'temperature': '27.3' }).parsed_body);

coll.addEntry("2015-09-01T16:20:00.000Z", validateBody({ 'temperature': '27.5', 'dewPoint': '17.1' }).parsed_body);
coll.addEntry("2015-09-01T16:30:00.000Z", validateBody({ 'temperature': '27.4', 'dewPoint': '17.3' }).parsed_body);
coll.addEntry("2015-09-01T16:40:00.000Z", validateBody({ 'temperature': '27.2' }).parsed_body);
coll.addEntry("2015-09-01T17:00:00.000Z", validateBody({ 'temperature': '28.1', 'dewPoint': '18.3' }).parsed_body);

//  ========== ROUTE LOGIC

module.exports = {
    'addMeasurement': function(req, res, next) {
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

    'deleteMeasurement': function(req, res, next) {
        var ts = req.params.timestamp;

        if(!coll.timestampExists(ts)) {
            return res.sendStatus(404);
        }

        coll.deleteEntry(ts);
        res.sendStatus(204);
    },

    'getMeasurement': function(req, res, next) {
        var ts = req.params.timestamp
        ,   item
        ;

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

        }

        res.type('json');
        return res.json(item);
    },

    'updateMeasurement': function(req, res, next) {
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
    },
    getStats: function(req, res, next) {

        var filtered, stats = [], query = req.query;

        debug("getStats", query); // query param

        filtered = coll.getDateRange(query.fromDateTime, query.toDateTime);

        if(filtered.length <= 0) {
            // res.status(200);
            return res.json([])
        }

        // if only one stat/metric, make an array
        if(_.isString(query.stat))  {   query.stat = [query.stat];      }
        if(_.isString(query.metric)) {  query.metric = [query.metric];  }

           

        _.each(query.metric, function(mt) {
            _.each(query.stat, function(st) {
                stats.push(calculateStat(st, mt, filtered));
            })
        })

        stats = _.compact(stats);

        return res.json(stats);
    }
};


//  ========== HELPER FUNCTIONS

function getMin(metric, fcoll) {
    var value = null;
}

// returns array of stats
function calculateStat(stat, metric, fcoll) {
    var ret = {
        'metric': metric,
        'stat': stat,
        'value': null
    },  count = 0;


    fcoll.each(function(item) {
        // debug(">> calculateStat", item.get(metric));

        if(item.get(metric)) {
            if(ret.value === null) {
                ret.value = item.get(metric);
            } else {
                switch(stat) {
                    case 'min':
                       if(item.get(metric) < ret.value) {
                            ret.value = item.get(metric);
                        }
                    break;
                    case 'max':
                        if(item.get(metric) >= ret.value) {
                            ret.value = item.get(metric);
                        }
                    break;
                    case 'average':
                        ret.value = ret.value + item.get(metric);
                    break;
                }
            }
            count++; // need to not use fcoll.getLength() b/c measurement may not have stat
        }
    });

    if(stat === 'average') {
        ret.value = parseFloat((ret.value / count).toFixed(1));
    }

    if(count <= 0) { // stat didn't exist...
        return null;
    }

    return ret;
}

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

            if(v.length === 0) {
                fields[key] = 0;
            } else if(isNaN(parseFloat(v))) {
                valid = false;
                return valid;
            }

            // this should "remove" timestamp w/o modifying req.body
            fields[key] = parseFloat(v); // update to float
        }
    })

    return {
        'is_valid':     valid,
        'parsed_body':  fields
    }
}
