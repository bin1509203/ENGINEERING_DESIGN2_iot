
// {
//     "name": "jquery-ajax-with-node.js",
//     "version": "1.0.0",
//     "main": "jquery-ajax-with-node.js",
//     "scripts": {
//       "start": "node jquery-ajax-with-node.js"
//     },
//     "dependencies": {
//       "jquery": "^2.1.4", npm install jquery --save
//       "jsdom-no-contextify": "^3.1.0", npm install jsdom-no-contextify --save
//       "xmlhttprequest": "^1.7.0" npm install xmlhttprequest --save
//     }
// }
var express = require("express"); 
var app = express();


app.set('views', './layouts');
app.set('view engine', 'pug');

var $ = require('jquery')(require('jsdom-no-contextify').jsdom().parentWindow);

// Support for Cross-domain request with using jQuery
// See: http://garajeando.blogspot.jp/2012/06/avoiding-xmlhttprequest-problem-using.html
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
$.support.cors = true;
$.ajaxSettings.xhr = function () {
	return new XMLHttpRequest;
}

// $.ajax({
// 	url: 'http://example.com/',
// 	type: 'GET',
// 	success: function(data, status, jq_xhr) {
// 		console.log(data);
// 	},
// 	error: function(jq_xhr, status, error_str) {
// 		console.log(error_str);
// 	}
// });

$.ajax({ 
    url: 'http://localhost:2000/ajax',
    type: 'GET',
    dataType: 'html'
})
.done(function(data) {
$('#container').html(data);
})
.fail(function() {
console.log("Something went wrong!");
});

app.get('/ajax', function(req, res){
    // var output =`
    // <h1>Device Status</h1>    
    //     <h2>ON</h2>
    // `;
    // res.send(output);
    var date_ = new Date();
    res.render('ajax', {date:date_ }); 

});

app.listen(2000, function(req,res){
    console.log('Connected, 2000 port!');
});