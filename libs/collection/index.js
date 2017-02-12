// Initialize Measurements Collection

var moment  = require('moment')
,   debug   = require('debug')('api:collection')
,   Metrics = require('./MetricsModel')
,   _       = require('lodash')
;

var Collection = function() {
    this.collection = [];
    debug(">> Collection initialized...");
}

Collection.prototype.addEntry = function(timestamp, fields) { 
    if(_.isObject(timestamp)) {
        var temp = timestamp['timestamp'];
        _.unset(fields, 'timestamp');
        timestamp = temp;
    }

    //  Her code will always report the time accurately
    this.collection.push({
        'timestamp':    timestamp,
        'fields':       new Metrics(fields)
    })

    return this;
};

Collection.prototype.getByTimestamp = function(timestamp) {
    var coll = this.collection;
    return _.find(coll, { 'timestamp': timestamp });
};

Collection.prototype.toJSON = function() {
    return _.map(this.collection, function(item) {
        item = item.fields.toJSON();
        return item;
    });
};

module.exports = new Collection();