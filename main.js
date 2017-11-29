var express = require("express"); 
var app = express();
var bodyParser = require('body-parser'); // for app.post 
var http = require("http");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.locals.pretty = true;

const ON = 1;
const OFF = 0;

var device_status = 0;

////////// send data from this device(refrigerator) to main server
var options = {
  hostname: '192.168.1.124', // main server address
  port: 2000,
  path: '/device/Refrigerator/status',
  method: 'POST',
  headers: {
      'Content-Type': 'application/json'
  }
};

app.post('/status', function(req,res){
    res.setHeader('Content-Type', 'application/json');
    setTimeout(function(){
        console.log("json test : "+req.body.name);
        res.send(JSON.stringify({
             DeviceName: req.body.name || null,
             DeviceStatus: req.body.status || null
        }));
    }, 1000)
    var info = req.body; // json 신호 받은 경우 info에 값 parsing 하여 저장

    var request = http.request(options, function(res) {
        console.log('Status: ' + res.statusCode);
        console.log('Headers: ' + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        res.on('data', function (body) {
          console.log('Body: ' + body);
        });
      });
    request.on('error', function(e) {
        console.log('problem with request: ' + e.message);
    });

    if(info.status === ON){ // ON signal을 받으면
        device_status = ON;
        console.log("ON Signal");
       
        request.write('{"name": "Refrigerator", "status": 1}', function(err){ // status info server로 전송
            request.end(); 
            console.log("send ON status to server"); 
        });


    }else if(info.status === OFF){ // OFF signal을 받으면
        device_status = OFF;
        console.log("OFF Signal");
       
        request.write('{"name": "Refrigerator", "status": 0}', function(err){// status info server로 전송
            request.end(); 
            console.log("send OFF status to server"); 
        });

    }else{
        console.log("communication error. ");
    }

});

app.listen(2000, function(req,res){
    console.log('Connected, 2000 port!');
});

