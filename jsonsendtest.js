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
// var request = http.request(options, function(res) {
//   console.log('Status: ' + res.statusCode);
//   console.log('Headers: ' + JSON.stringify(res.headers));
//   res.setEncoding('utf8');
//   res.on('data', function (body) {
//     console.log('Body: ' + body);
//   });
// });
// request.on('error', function(e) {
//   console.log('problem with request: ' + e.message);
// }); 이렇게 global 로 http request 선언을 하면 write after end 에러가 뜬다.


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
    if(info.status === ON){
        device_status = ON;
        console.log("ON Signal");
        //res.redirect('/status'); err 발생함
    }else if(info.status === OFF){
        device_status = OFF;
        console.log("OFF Signal");
        //res.redirect('/status'); err 발생함
    }else{
        console.log("communication error. ");
    }

});


// request.write('{"name": "Refrigerator", "status": 1}', function(err){ request.end(output); }); 해보기
// write 끝나기 전에 end가 실행된걸수도 있음.
////// 문제점 : request.end(); 이게 코드에 들어가면 write after end 에러가 뜬다.
////// 해결법 : json 을 보낼 app.get 내부에 var request 를 선언해야 에러가 안뜨고
///// 아예 js 파일에 global 로 var request 선언하면 에러가 뜬다.

app.get('/status', function(req, res){
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

    if(device_status === ON){
        
        var output =`
        <h1>Device Status</h1>    
            <h2>ON</h2>
        `;
        res.send(output); // res.send랑 request.end 가 동시에 반환해서 충돌난걸까..? => 아님.
        console.log("running");

        request.write('{"name": "Refrigerator", "status": 1}', function(err){ 
            request.end(); 
            console.log("send ON status to server"); 
        });
        request.on('error', function(e) {
            console.log('problem with request: ' + e.message);
          });
    }else if(device_status === OFF){
        
        var output =`
        <h1>Device Status</h1>    
            <h2>OFF</h2>
        `;
        res.send(output);
        console.log("not running");

        request.write('{"name": "Refrigerator", "status": 0}', function(err){
            request.end(); 
            console.log("send OFF status to server"); 
        });
        request.on('error', function(e) {
            console.log('problem with request: ' + e.message);
          });
    }else{
        console.log("communication error. ");
    }

});

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
}



app.listen(2000, function(req,res){
    console.log('Connected, 2000 port!');
});

// for ( i = 1; i < 100 ; i++){
//     sleep(1000);
//     console.log("for loop test: "+i);
// }