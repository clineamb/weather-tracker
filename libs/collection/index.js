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
};

Item.prototype.get = function(input) {
    return this.fields.get(input);
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

// comes from _.filter/_.map that need to be a Collection
Collection.prototype.import = function(array_of_items) {
    var indexes = this.indexes;

    this.collection = array_of_items;

    _.each(this.collection, function(item, index) {
        indexes[item.timestamp] = index; 
    });

    return this;
};

Collection.prototype.addEntry = function(timestamp, fields) {

    this.collection.push(new Item(timestamp, new Metrics(fields)));
    this.indexes[timestamp] = this.collection.length - 1;

    debug(">> coll#addEntry indexes", this.indexes); 

    return this;
};

Collection.prototype.deleteEntry = function(timestamp) {
    var index = this.indexes[timestamp];
    _.pullAt(this.collection, index);
    _.unset(this.indexes, timestamp);

    return this;
};

Collection.prototype.each = function(iteratee) {
    _.each(this.collection, function(item, index, list) {
        iteratee(item, item.timestamp, list);
    });

    return this;
};

Collection.prototype.getAllByDay = function(day) {
   var groups = _.groupBy(this.collection, 'day');
    return groups[day];
};

Collection.prototype.getByTimestamp = function(timestamp) {
    return _.find(this.collection, { 'timestamp': timestamp });
};

Collection.prototype.getDateRange = function(ts1, ts2) {
    var mts1 = moment(ts1)
    ,   mts2 = moment(ts2)
    ,   filtered
    ;

   
    filtered = new Collection();

    filtered = filtered.import(_.filter(this.collection, function(item, index) {
        var im = moment(item.timestamp);

        debug(">> coll#getDateRange", index, im.isBetween(mts1, mts2, null, '[]'));

        if(im.isBetween(mts1, mts2, null, '[)')) {
            return item;
        }
    }));

    debug(">> coll#getDateRange", filtered.toJSON());

    return filtered;
};

Collection.prototype.getLength = function() {
    this.length = this.collection.length;
    return this.collection.length;
};

Collection.prototype.timestampExists = function(timestamp) {

    debug(">> coll#timestampExists", this.indexes[timestamp], "undefined?", _.isUndefined(this.indexes[timestamp]));
    return !_.isUndefined(this.indexes[timestamp]);
};

// this could work for both PUT and PATCH
Collection.prototype.updateByTimestamp = function(timestamp, fields) {

    var index = this.indexes[timestamp];

    if(index < 0 || _.isUndefined(index)) {
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

module.exports = new Collection(); // init collection
