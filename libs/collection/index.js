// Initialize Measurements Collection

var moment  = require('moment')
,   debug   = require('debug')('api:collection')
,   Metrics = require('./MetricsModel')
,   _       = require('lodash')
;

var Collection = function() {
    this.collection = [];
    this.indexes = [];

    debug(">> Collection initialized...");
}

Collection.prototype.exists = function(timestamp) {
    // TODO: check if proper timestamp here.
    return !_.isUndefined(this.indexes[timestamp]);
};

Collection.prototype.addEntry = function(timestamp, fields) { 

    //  Her code will always report the time accurately
    this.collection.push({
        'timestamp':    timestamp,
        'fields':       new Metrics(fields)
    });

    //  *Should* remain parallel to collection, but need this for exists
    //  FIXME: has to be something more efficient.
    this.indexes.push(timestamp);

    return true;
};

Collection.prototype.getByTimestamp = function(timestamp) {
    var coll = this.collection;
    return _.find(coll, { 'timestamp': timestamp });
};

Collection.prototype.toJSON = function() {
    return _.map(this.collection, function(item) {
        item.fields = item.fields.toJSON();
        return item;
    });
};

module.exports = new Collection();