/**
 * Created by fanyongsheng on 2017/7/10.
 */
var _anychat = require('./anychat.js');
var log_obj  = require('./log.ts');
var log_content = '';//日志内容
window.AnyChatSDK = _anychat.instance;
var routes = [];
log(window.AnyChatSDKVersion);
function log(msg){
    var myDate = new Date();//获取系统当前时间
    var day = myDate.getDate()>9?myDate.getDate():'0'+myDate.getDate();
    var month = myDate.getMonth()+1>9?myDate.getMonth()+1:'0'+ (myDate.getMonth()+1);
    var year = myDate.getFullYear();
    var hour = myDate.getHours()>9?myDate.getHours():'0'+myDate.getHours();
    var minutes = myDate.getMinutes()>9?myDate.getMinutes():'0'+myDate.getMinutes();
    var seconds = myDate.getSeconds()>9?myDate.getSeconds():'0'+myDate.getSeconds();
    console.log(msg);

    //[2017-09-26 18:37:40(331)][I]
    _anychat.Uploadlog('['+year+'-'+month+'-'+day+' '+hour+':'+minutes+":"+seconds+"] "+msg);

    log_content = log_content +'\r\n & time：'+hour+':'+minutes+":"+seconds+":  "+msg;
    msg = '<p><span class="text-info">time：'+hour+':'+minutes+":"+seconds+"</span>&nbsp;&nbsp;&nbsp;&nbsp;"+msg+'</p>';
    if(document.getElementById('log')){
        var val = document.getElementById('log').innerHTML;
        document.getElementById('log').innerHTML = msg+val;
    }
    log_obj.putLog(log_content);
}

window.log = log;
window.log_obj = log_obj;
