module.exports = function(tryjson){

    var route = require('express').Router();
    var fs = require('fs');
    //app.use(express.static(path.join(__dirname, 'www')));

    const ON = 1;
    const OFF = 0;

    //// device 추가   
    route.get('/new', function(req,res){
        fs.readdir('./db/device', function(err, files){
            if(err){
                console.log(err)
                res.status(500).send('Add Error');
            }
            res.render('add');
        });
    });

    //// device 삭제
    route.get('/delete/:id', function(req,res){
        var name = req.params.id;
        fs.unlink('./db/device/'+name, function(err){
            if(err){
                console.log(err);
                res.status(500).send('Delete Error');
            }
            res.redirect('/device');
        })
    });

    // /// current date calculation
    // var today = new Date(); // 1970년~ 현재 를 밀리초로
    // var dd = today.getDate();
    // var mm = today.getMonth()+1; //January is 0!
    // var yyyy = today.getFullYear();
    // var hour = today.getHours();
    // var min = today.getMinutes();
    // var sec = today.getSeconds();

    // if(dd<10) {
    //     dd = '0'+dd
    // } 
    
    // if(mm<10) {
    //     mm = '0'+mm
    // } 
    
    // var date = yyyy + '-' + mm + '-' + dd + ',' + hour + ':' + min + ':' + sec;

    // /// 과거 시간 계산기
    // Date.prototype.addDays = function (n) {
    //     var time = this.getTime();
    //     var changedDate = new Date(time + (n * 24 * 60 * 60 * 1000));
    //     this.setTime(changedDate.getTime());
    //     return this;
    // };
    // console.log(today);
    // var past = today;
    // past = past.addDays(-15);


    route.post('/', function(req,res){
        var name = req.body.name;
        var date = new Date();
        var KOR_date = date.toLocaleString('de-DE', {timeZone: 'Asia/Seoul' });
        var rare_data = {
            "power" : req.body.power,
            "start_time" : 0,// 수정필요
            "start_point" : 0,
            "end_time" : 0,// 수정필요
            "end_point": 0,
            "create" : KOR_date,
            "status" : OFF,
            "duration" : 0 // 오늘까지 이번달 총 사용시간
        };
        var data = tryjson.stringify(rare_data); // 객체를 json format으로 변경
        fs.writeFile('./db/device/'+name, data, function(err){
            if(err){
                console.log(err);
                res.status(500).send('Internal Server Error');
            }
            res.redirect('/device');
        });
    });

    //// device 목록
    route.get(['/', '/:id'], function(req,res){
        fs.readdir('./db/device', function(err, files){
            if(err){// "db/device" directory(폴더)에 있는 contents를 읽어와 files 에 배열로 저장
                console.log(err)
                res.status(500).send('Internal Server Error');
            }
            var name = req.params.id;
            if(name){ // id 값이 존재하면 즉 /device/:id 경로인 경우
                fs.readFile('./db/device/'+name, 'utf-8', function(err,data){ 
                    if(err){// db/device/id변수값 에 해당하는 파일 읽어들여 data 라는 인자로 받아들임.
                        console.log(err);
                        res.status(500).send('Internal Server Error');
                    }
                    //console.log(tryjson.parse(data).power); // 우리가 다룰때는 json을 다시 파싱하여 객체로.
                    var device = tryjson.parse(data);

                    res.render('device_each', {name:name, power:device.power, start:device.start_time, end:device.end_time, status:device.status, create:device.create}); 
                    // 페이지에서 볼때는 json 파일. 즉 텍스트로 봐야 볼 수 있다. 객체는 못봄.
                    
                })
            } else{ // id 값이 없을 때 즉 /device 경로인 경우
                res.render('device', {devices:files});
            }
        });
    });
    //// Json 통신 테스트
    // route.post('/form',function(req, res){
    //     res.setHeader('Content-Type', 'application/json');
        
    //     //mimic a slow network connection
    //     setTimeout(function(){
    //         console.log(req.body.status);
    //         res.send(JSON.stringify({
    //              firstName: req.body.name || null,
    //              lastName: req.body.status || null
    //         }));
        
    //     }, 1000)
    // });

    //// device 통신
    route.post('/:id/status', function(req,res){
        res.setHeader('Content-Type', 'application/json');
        
        //mimic a slow network connection
        setTimeout(function(){
            console.log("json test : "+req.body.name);
            res.send(JSON.stringify({
                 DeviceName: req.body.name || null,
                 DeviceStatus: req.body.status || null
            }));
        }, 1000)
        var info = req.body;
        var name = req.params.id;
        fs.readFile('./db/device/'+name, 'utf-8', function(err,data){
            if(err){// db/device/id변수값 에 해당하는 파일 읽어들여 data 라는 인자로 받아들임.
                console.log(err);
                res.status(500).send('Internal Server Error');
            }
            var device = tryjson.parse(data);
            if(info.status === ON){ // device가 ON 신호를 보낸경우
                console.log("ON signal");
                if(device.status === OFF){ // 꺼져있던 device가 켜진 경우
                    device.status = ON;
                    device.start_time = Date();
                    device.start_point = new Date().getTime();
                } // 이미 켜져있는 device가 지속적으로 ON 신호를 보낸 경우에
                device.end_time = 0; // 켜져있으니 꺼진시간 없음.
                device.end_point = 0;
            }else if(info.status === OFF){ // device가 OFF 신호를 보낸경우
                console.log("OFF signal");
                if(device.status === ON){ // 켜져있던  device가 꺼진 경우
                    device.status = OFF;
                    device.end_time = Date();
                    device.end_point = new Date().getTime();
                    device.duration += device.end_point - device.start_point; // 켜져있던 시간 저장
                } // 이미 꺼져있는 device가 지속적으로 OFF 신호 보낸 경우엔 do nothing
            }else{
                console.log("device communication status error");
            }
            var device_info = tryjson.stringify(device);
            fs.writeFile('./db/device/'+name, device_info, function(err){
                if(err){
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                }
            });
        })
    });

    //// device 제어
    route.get('/:id/control', function(res,req){

    });

    return route;
}