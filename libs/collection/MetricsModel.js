// Metric w/ possible type-checking?

var _ = require('lodash')
,   MetricsModel
;

MetricsModel = function(value_obj) {
    this.fields = {};

    if(_.isObject(value_obj)) {
        this.fields = _.extend(this.fields, value_obj);
    }
};

MetricsModel.prototype.validate = function(value) {
    
    if(_.isObject(value)) {
        _.each(value, function(v) {
            if(!_.isNumber(v)) {
                return false; // one metric is not good, reject whole thing.
            }
        })
    }

    return _.isNumber(value);
}

MetricsModel.prototype.set = function(name, val) {

    if(_.isObject(name)) {
        this.fields = _.extend(this.fields, name);
    } else {
        this[name] = val;
    }

    return this;
}

MetricsModel.prototype.get = function(name) {

    if(_.isArray(name)) {
        return _.pick(this.fields, name);
    }

    return fields[name];
}

module.exports = MetricsModel;