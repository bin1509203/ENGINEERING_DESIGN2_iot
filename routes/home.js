module.exports = function(tryjson){
    
        var route = require('express').Router();
        var fs = require('fs');
        const ON = 1;
        const OFF = 0;
        /// current date calculation
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth()+1; //January is 0!
        var yyyy = today.getFullYear();
        var hour = today.getHours();
        var min = today.getMinutes();
        var sec = today.getSeconds();
    
        if(dd<10) {
            dd = '0'+dd
        } 
        
        if(mm<10) {
            mm = '0'+mm
        } 
        
        date = yyyy + '/' + mm + '/' + dd + ',' + hour + ':' + min + ':' + sec;
    
    
        //// device 목록
        route.get('/', function(req,res){
            fs.readdir('./db/device', function(err, files){
                if(err){// "db/device" directory(폴더)에 있는 contents를 읽어와 files 에 배열로 저장
                    console.log(err)
                    res.status(500).send('Internal Server Error');
                }
                console.log(files.length);
                // 총 사용 전력 계산 => 매월 1일 초기화필요 + 디바이스 종료할때마다 갱신 필요
                if(files){ // file 값이 존재하면 즉 /db/device 에 저장된것이 있다면
                    var kwatt_hour = 0;
                    for(i = 0; i < files.length ; i++)
                    {
                        var duration_s = 0;
                        var duration_h = 0;
                        // readFile 로 하면 파일 읽는 동안 아래 전기계산을 먼저 해버림.
                        var device = tryjson.parse(fs.readFileSync('./db/device/'+files[i], 'utf-8'));
                        if(device.status === ON) // device가 켜져있는 경우
                        {
                            var current = new Date().getTime();
                            console.log("current time:   "+current);
                            duration_s = current - device.start_point; // 실시간 사용 시간
                        }
                        duration_s = duration_s + device.duration; // 실시간 사용 시간 + 이전 사용 시간
                        duration_h = duration_s/3600;
                        kwatt_hour += device.power*duration_h/1000;
                        // fs.readFileSync('./db/device/'+files[i], 'utf-8', function(err,data){ 
                        //     if(err){// db/device/id변수값 에 해당하는 파일 읽어들여 data 라는 인자로 받아들임.
                        //         console.log(err);
                        //         res.status(500).send('Internal Server Error');
                        //     }                            
                        //     var device = tryjson.parse(data);
                        //     duration_s = device.end_point - device.start_point;
                        //     duration_h = duration_s/3600;
                        //     console.log('duration: '+duration_h+'power: '+device.power);
                        //     kwatt_hour += device.power*duration_h/1000;
                        //     console.log('kwh: '+kwatt_hour);
                        //     //console.log(tryjson.parse(data).power); // 우리가 다룰때는 json을 다시 파싱하여 객체로.
                        // })
                    }
                    // 전기세 계산, 주택용 고압 기준
                    var price = 0;
                    if(kwatt_hour <= 200)
                    {
                        price = 730 + 78.3*kwatt_hour;
                        price = price*(1+0.1+0.037);
                    }else if(kwatt_hour <= 400)
                    {
                        price = 1260 + 147.3*kwatt_hour;
                        price = price*(1+0.1+0.037);
                    }else if(kwatt_hour > 400)
                    {
                        price = 6060 + 215.6*kwatt_hour;
                        price = price*(1+0.1+0.037);
                    }
                    else
                    {
                        console.log("no device usage");
                    }
                    console.log('duration: '+price+'power: '+kwatt_hour);
                    res.render('home', {time:date ,device_num:files.length, power:kwatt_hour, price:price, description:'Welcome!!'});
                } else{ // id 값이 없을 때 즉 /topic 경로인 경우
                    console.log("no device resistered");
                    res.render('home', {time:date ,device_num:'0', power:'N/A', price:'N/A', description:'No devices connection!!'});
                }
            });
        });
    
        return route;
    }