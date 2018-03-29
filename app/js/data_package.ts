/**
 * Created by fanyongsheng on 2017/8/2.
 */

declare function log(msg:string);
declare var exports;

let sendData = {};//缓存数据
let index_seq:number = 0; //序号
let index_last_seq:number = 0;//上次的
let way;//外部webrtc对象
let index_notify:number = 0;

let timer_:Readonly<number> = 3000;




//发包处理
function data_pack(send_json:any):any {
    if (send_json.data.cmdcode !== 'heartbeat') {
        send_json.seq = ++index_seq;
        sendData[index_seq] = send_json;
    }
    return send_json;
}

//清理包
function delet_pack(index:number):void {
    for (var i = index; i >= index_last_seq; i--) {
        delete sendData[i];
    }
    index_last_seq = index;
}

//设置way
function setWay(getway:any) {
    way = getway;
    setInterval(function () {
        ack();
    }, timer_);

}

//设置最大的notify_index
function set_big_index_notify(index:number){
    if(index-index_notify===1){

    }else{
        //重发
        restrans(index_notify);
    }
    index_notify = index;
}



//发送ack
function ack():void {
    var send_json = {
        eventname: "ack",
        ssrc: 0,
        seq: index_notify,
        data: {}
    };


    if (way.is_socket) {
        way.socket.send(
            JSON.stringify(send_json)
        );
    }
}

//重发
function restrans(index:number):void{
    var send_json = {
        "eventname": "request",
        "ssrc":0,
        "seq":0,
        "data":{cmdcode:"restrans", "begin_reg":++index}
    };

    if (way.is_socket) {
        way.socket.send(
            JSON.stringify(send_json)
        );
    }
}

//重发数据到服务端
function restrans_to_service(index:any):void{

    for(var i in sendData){
        if(i > index) {
            if (way.is_socket && sendData[i]) {
                way.socket.send(
                    JSON.stringify(sendData[i])
                );
                delete sendData[i];
            }
        }
    }
}


//清理数据
function clear_all():void{
    index_seq = 0;
    index_notify = 0;
}

exports.data_pack = data_pack;
exports.delt_pack = delet_pack;
exports.setWay = setWay;
exports.set_big_index_notify = set_big_index_notify;
exports.restrans_to_service = restrans_to_service;
exports.clear_all = clear_all;
