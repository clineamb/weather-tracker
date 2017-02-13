var express         = require('express')
,   bodyParser      = require('body-parser')
,   path            = require('path')
,   logger          = require('morgan')
,   nunjs           = require('./libs/nunjucks')
//  APP SPECS
,   router          = require('./routes')
,   app             = express()
;

// view engine setup
app.set('views', path.join(__dirname, "views"));
app.set('view engine', "nunjs"); // .nunjs
nunjs(app); // init

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//  Quick middleware things
app.use(function(req, res, next) {

    //  Attach env
    req.env = app.get('env');

    next();
});

//  Attach routers.
app.use(router);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if(app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });

}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
