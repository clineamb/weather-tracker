// Initialize Measurements Collection

var moment  = require('moment')
,   debug   = require('debug')('api:collection')
,   _       = require('lodash')
,   moment  = require('moment')
,   Metrics = require('./MetricsModel')
,   Item, Collection
;

Item = function(ts, metrics) {
    this.timestamp = ts;
    this.day = moment(ts).format("YYYY-MM-DD");
    this.fields = metrics;
}

Item.prototype.set = function(input) {
    this.fields.set(input);
    return this;
}

Item.prototype.toJSON = function() {
    return _.extend({
        'timestamp':    this.timestamp,
    }, this.fields.toJSON());
};

// COLLECTION

Collection = function() {
    this.collection = [];
    this.indexes = [];

    debug(">> Collection initialized...");
}

Collection.prototype.addEntry = function(timestamp, fields) {

    //  Her code will always report the time accurately
    this.collection.push(new Item(timestamp, new Metrics(fields)));
    this.collection = _.uniqBy(this.collection, 'timestamp');
    this.indexes = _.mapValues(this.collection, function(i) {
        return i.timestamp;
    });

    return this;
};

Collection.prototype.timestampExists = function(timestamp) {
    return (_.indexOf(this.collection, timestamp) > -1);
}

Collection.prototype.getAllByDay = function(day) {
   var groups = _.groupBy(this.collection, 'day');
    return groups[day];
};

Collection.prototype.getByTimestamp = function(timestamp) {
    return _.find(this.collection, { 'timestamp': timestamp });
};

// this could work for both PUT and PATCH
Collection.prototype.updateByTimestamp = function(timestamp, fields) {

    var index = _.indexOf(this.indexes, timestamp);

    if(index < 0) {
        return false;
    }

    debug(">> coll#updateByTimestamp", index, this.collection[index]);
    this.collection[index].set(fields);

    return true;
};

Collection.prototype.toJSON = function() {
    return _.map(this.collection, function(ci) {
        return ci.toJSON();
    });
};

module.exports = new Collection();