var nunjucks    = require('nunjucks')
,   path        = require('path')
,   url         = require('url')
,   env
;

module.exports = function(app) {

    env = new nunjucks.Environment(
        new nunjucks.FileSystemLoader(app.get('views'))
    ,   { 'watch': true, 'autoescape': true }
    );

    /* ========== ADD FILTERS ========== */

    //  Example Filter
    env.addFilter('strlen', function(str) {

        if(typeof str != 'string') {
            return 0;
        }
        
        return str.length;
    });

    return env.express(app);

};