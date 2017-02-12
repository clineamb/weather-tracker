var express     = require('express')
,   router      = express.Router()
;

router.route("/")
    .get(function(req, res) {
        return res.json({});
    })
;

module.exports = router;