module.exports = function(){
    var express = require('express', 'express-static');
    var bodyParser = require('body-parser'); // for app.post 

    var app = express();
    
    var path = require('path');
    app.use(express.static(path.join(__dirname, '../css'))) 
    // to use relative address for loading css
    // __dirname : the path that express.js exists[xx/config]. so / means /config
    // ../css : /ENGINEERING DESIGN/css
    // now we can use files in "css"folder using http://localhost:2000/file_name

    app.set('views', './layouts');
    app.set('view engine', 'pug');
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.locals.pretty = true;

    return app;
}