/**
 * Created by fanyongsheng on 2017/7/20.
 */
//心跳

let timer_handle = 5; //心跳定时器
let timer;//定时器句柄


declare function log(msg:string);
declare var exports;
function start(getway: any): void {
    var data = {};
    clearInterval(timer);
    timer = setInterval(()=>{
        getway.socket_send('request',0,'heartbeat',data);
    },timer_handle*1000);
}

function notify(errorcde:number): void{
   //log('心在跳');
}

function stop_log(){
    timer && clearInterval(timer);
}


exports.start = start;

exports.notify = notify;

exports.stop = stop_log;


