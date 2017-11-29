module.exports = function(tryjson){
    
        var route = require('express').Router();
    
        
        route.get('/', function(req,res){

                res.render('contact');
            
        });
 
        return route;
    }