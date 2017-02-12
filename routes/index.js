var express     = require('express')
,   router      = express.Router()
,   weather     = require('../libs/weather')
;

function sendBlankJson(req, res) {
    return res.json({})
}

function checkForTimestamp(req, res, next) {
    if(!req.body) {
        return res.sendStatus(400);
    }

    if(!req.body.timestamp) {
        return res.sendStatus(400);
    }

    next();
}

router.route("/")
    .get(sendBlankJson)
;

router.route("/measurements")
    .get(sendBlankJson)
    //  Feature: Add a measurement
    .post(
        checkForTimestamp,
        weather.addMeasurement
    )
;

router.route("/measurements/:timestamp")
    //  Feature: get a measurement
    .get(function(req, res) {
        // Can be a full timestamp
        // or just a day (return array of measurements)
    })
    .put(function(req, res) {

    })
    .patch(function(req, res) {

    })
    .delete(function(req, res) {

    })
;

router.route("/stats")
    .get(function(req, res) {
        //  can have query params
        //  stat, metric, fromDatetime, toDatetime
    })

module.exports = router;