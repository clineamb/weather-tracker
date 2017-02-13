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
    this.indexes = {};

    debug(">> Collection initialized...");
}

Collection.prototype.addEntry = function(timestamp, fields) {

    this.collection.push(new Item(timestamp, new Metrics(fields)));
    this.indexes[timestamp] = this.collection.length - 1; 

    return this;
};

Collection.prototype.deleteEntry = function(timestamp) {
    var index = this.indexes[timestamp];
    _.pullAt(this.collection, index);
    _.unset(this.indexes, timestamp);

    return this;
};

Collection.prototype.getAllByDay = function(day) {
   var groups = _.groupBy(this.collection, 'day');
    return groups[day];
};

Collection.prototype.getByTimestamp = function(timestamp) {
    return _.find(this.collection, { 'timestamp': timestamp });
};

Collection.prototype.timestampExists = function(timestamp) {
    console.log(this.indexes[timestamp]);
    return !_.isUndefined(this.indexes[timestamp]);
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