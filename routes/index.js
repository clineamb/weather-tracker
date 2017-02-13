var express = require('express')
,   router  = express.Router()
,   debug   = require('debug')('api:routes')
,   weather = require('../libs/weather')
;

function sendBlankJson(req, res) {
    return res.json({})
}

function checkForTimestamp(req, res, next) {

    debug(">> req.body", req.body);

    if(!req.body.timestamp && !req.params.timestamp) {
        return res.sendStatus(400);
    }

    next();
}

router.route("/")
    .get(sendBlankJson)
;

router.route("/measurements")
    .get(sendBlankJson)
    .post(
        checkForTimestamp,
        weather.addMeasurement      //  Feature: Add a measurement
    )
;

router.route("/measurements/:timestamp")
    .all(checkForTimestamp)
    .get(weather.getMeasurement)    //  Feature: Get a measurement
    .put(weather.updateMeasurement) //  Feature: Update measurement
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