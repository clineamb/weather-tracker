// Metric w/ possible type-checking?

var _       = require('lodash')
,   debug   = require('debug')('api:MetricsModel')
,   MetricsModel
;

MetricsModel = function(value_obj) {
    this.fields = {};

    if(_.isObject(value_obj)) {
        this.fields = _.extend(this.fields, value_obj);
    }
};

MetricsModel.prototype.set = function(name, val) {

    if(_.isObject(name)) {
        _.each(name, function(v, key) {
            name[key] = parseFloat(v);
        });

        this.fields = _.extend(this.fields, name);
    } else {
        this[name] = parseFloat(val);
    }

    return this;
}

MetricsModel.prototype.get = function(name) {

    if(!name) {
        return this.fields;
    }

    if(_.isArray(name)) {
        return _.pick(this.fields, name);
    }

    return this.fields[name];
};

MetricsModel.prototype.toJSON = function() {
    return this.fields;
};

module.exports = MetricsModel;