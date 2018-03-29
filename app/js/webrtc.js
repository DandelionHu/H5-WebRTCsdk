/**
 * Created by fanyongsheng on 2017/7/10.
 */

var data_package = require('./data_package.ts');
var config = require('./config.js');
var PeerConnection = (window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || '');
var URL = (window.URL || window.webkitURL || window.msURL || window.oURL || '');
var getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || '');
var nativeRTCIceCandidate = (window.mozRTCIceCandidate || window.RTCIceCandidate || '');
var nativeRTCSessionDescription = (window.mozRTCSessionDescription || window.RTCSessionDescription || ''); // order is very important: "RTCSessionDescription" defined in Nighly but useless
var moz = !!navigator.mozGetUserMedia;
var iceServer = {
    "iceServers": [{
        "urls": "stun:h5.anychat.cn:9000"
    }]
};

var packetSize = 1000;
/**********************************************************/
/*                                                        */
/*                       网络事件处理器                       */
/*                                                        */
/**********************************************************/
function EventEmitter() {
    this.events = {};
}
//绑定事件函数
EventEmitter.prototype.on = function (eventName, callback) {
    this.events[eventName] = this.events[eventName] || [];
    this.events[eventName].push(callback);
};
//触发事件函数
EventEmitter.prototype.emit = function (eventName, _) {
    var events = this.events[eventName],
        args = Array.prototype.slice.call(arguments, 1),
        i, m;


    if (!events) {
        return;
    }
    for (i = 0, m = events.length; i < m; i++) {
        events[i].apply(null, args);
    }
};


/**********************************************************/
/*                                                        */
/*                   流及信道建立部分                     */
/*                                                        */
/**********************************************************/

/*******************基础部分*********************/
function webrtc() {
    //本地media stream
    this.localMediaStream = null;
    //所在房间
    this.roomid = "";
    //接收文件时用于暂存接收文件
    this.userid = -1;
    //本地WebSocket连接
    this.socket = null;
    //本地socket的id，由后台服务器创建
    this.sessionid = null;
    //socket is open
    this.is_socket = false;
    //保存所有与本地相连的peer connection， 键为socket id，值为PeerConnection类型
    this.peerConnections = {};
    //保存所有与本地连接的socket的id
    this.connections = [];
    //初始时需要构建链接的数目
    this.numStreams = 0;
    //初始时已经连接的数目
    this.initializedStreams = 0;
    //浏览器
    this.browserName = '';
    //是不是正常关闭
    this.normalCloseWebsocket = false;
    //房间用户列表
    this.userlist = [];
    //重连时间
    this.timeOut = 0;
    //超时时间设置 单位 s
    this.timeOutInt = config.timeOutInt;
    //丢网络index；
    this.srrc_index = 0;
    //send 网络数据
    this.sendData = {};
    //系统android ios window;
    this.system = '';
    //特殊处理
    this.mobile_type = 0;
    //队列id
    this.queueId = '';
    //视频码率
    this.bitrate = config.bitrate;
    //视频默认分辨率宽
    this.videowidth = config.videowidth;
    //视频默认分辨率高
    this.videoheight = config.videoheight;
    //视频默认帧率
    this.videofps = config.videofps;
    //是否打开麦克风
    this.is_open_microphone = false;
    //视频idenx
    this.camera_index = 0;
    //麦克风index
    this.microphone_index = 0;
}


//继承自事件处理器，提供绑定事件和触发事件的功能
webrtc.prototype = new EventEmitter();


//本地连接信道，信道为websocket
webrtc.prototype.connect = function (addrs) {
    var socket,
        that = this;
    // 创建WebSocket
    if (this.socket) {
        log('不需要重连，已经存在websocket 链接');
        return false;
    }
    var isHttpsProtocol = 'https:' == document.location.protocol ? true : false;
    var wsurl = isHttpsProtocol ? 'wss:' + addrs[0] : 'ws:' + addrs[0];

    if ('WebSocket' in window) {
        socket = this.socket = new WebSocket(wsurl, 'anychat-protocol');
    } else if ('MozWebSocket' in window) {
        socket = this.socket = new MozWebSocket(wsurl, 'anychat-protocol');
    } else {
        log('不支持websocket');
        alert('WebSocket is not supported by this browser.');
        return;
    }
    socket.onopen = function () {
        that.is_socket = true;
        var json = {};
        if (that.sessionid) {
            json = {
                "eventname": "request",
                "ssrc": 0,
                "data": {
                    "cmdcode": "tokenconnect",
                    "version": AnyChatSDKVersion,
                    "sessionid": that.sessionid
                }
            }
        } else {
            json = {
                "eventname": "request",
                "ssrc": 0,
                "data": {
                    "cmdcode": "connect",
                    "version": AnyChatSDKVersion,
                }
            }
        }
        socket.send(JSON.stringify(json));
    };

    socket.onmessage = function (message) {
        var json = JSON.parse(message.data);
        var data = json.data;
        if (typeof data !== 'object') {
            json.data = JSON.parse(data);
        }



        if (json.eventname) {
            that.emit(json.eventname, json);
        } else {
            that.emit("socket_receive_message", socket, json);
        }

    };

    socket.onerror = function (error) {
        console.log('socket_error');
        that.socket = false;
        that.is_socket = false;
        that.emit("socket_error", error, socket);
        // that.emit("close_websocket", error);
    };

    socket.onclose = function (data) {
        that.is_socket = false;
        that.socket = false;
        if (!that.normalCloseWebsocket) {
            that.emit("close_websocket", data);
        }
        that.normalCloseWebsocket = false;
    };

    that.on('ready', function () {
        //that.createPeerConnections();
        //that.addStreams();
        //that.addDataChannels();
        //that.sendOffers();
    });
};


/**
 * 向网关服务器发送请求
 * @param eventnamem
 * @param ssrc
 * @param cmdcode
 * @param data
 */
webrtc.prototype.socket_send = function (eventnamem, ssrc, cmdcode, data) {
    var send_json = {};
    send_json.eventname = eventnamem;
    send_json.ssrc = 0;
    if (data.userid) {
        data.userid = parseInt(data.userid);
    }
    send_json.data = {};
    send_json.data = data;
    send_json.data.cmdcode = cmdcode;

    send_json = data_package.data_pack(send_json);
    //send_json = this.data_pack(send_json);
    //log(JSON.stringify(send_json));
    if (this.is_socket) {
        try {
            if (this.socket.readyState == 1) {
                this.socket.send(
                    JSON.stringify(send_json)
                );
            }
        } catch (e) {
            log('socket' + e);
        }

    }

};



webrtc.prototype.data_pack = function (send_json) {
    //if(send_json.data.cmdcode !== 'heartbeat')
    //{
    //    send_json.seq =  ++this.srrc_index;
    //    this.sendData[send_json.seq] = send_json;
    //}
    //return send_json;

};

var getBroswerVersion = function(){
    var ua = navigator.userAgent;
    var arr = navigator.userAgent.split(' '); 
    var Version = '';  //版本
    var VersionNumber = '';   //版本号

    var isFireFox = /(?:Firefox)/.test(ua);
    var isChrome = /(?:Chrome)/.test(ua);
    var isTablet = /(?:iPad|PlayBook)/.test(ua)||(isFireFox && /(?:Tablet)/.test(ua));
    var isWindowsPhone = /(?:Windows Phone)/.test(ua);
    var isSymbian = /(?:SymbianOS)/.test(ua) || isWindowsPhone;
    var isPhone = /(?:iPhone)/.test(ua) && !isTablet;
    var isOs = /(?:OS 11)/.test(ua);
    var isCrios = /(?:CriOS)/.test(ua); //phone 谷歌
    var isFxios = /(?:FxiOS)/.test(ua); //火狐
    var isAndroid = /(?:Android)/.test(ua); 
    var isUc = /(?:Linux; U;)/.test(ua);  
    var isVersion = /(?:Version)/.test(ua);  
    var isQB = /(?:MQQBrowser|QQ)/.test(ua);  //qq
    var isPc = !isPhone && !isAndroid && !isSymbian;  
    var isSafari = /(?:Safari)/.test(ua);

    console.info(arr);
    for(var i=0;i < arr.length;i++){
        if(/chrome/i.test(arr[i])){
            Version = arr[i]
        }else if(/Firefox/i.test(arr[i])){
            Version = arr[i]
        }
        
    }
    console.info(Version);
    if(Version){
        VersionNumber=Number(Version.split('/')[1].split('.')[0]);
    } 


    if(isPc){
        if(isChrome){
            if(VersionNumber<38){
                return false;
            }
        }else if(isFireFox){
            if(VersionNumber<34){
                return false;
            }
        }
    }else if(isAndroid){
        if(isUc){
            return false;
        }
        if(isVersion){
            if(!isQB){
                return false;
            }
        }

    }else if(isPhone){
        if(isOs){
            if(isSafari){
                if(isCrios||isFxios){
                    return false;
                }
            }else{
                return false;
            }
        }else{
            return false;
        }
    }

    return true;
}

//判断是否支持webrtc
webrtc.prototype.support = function () {
        //判断版本
        
    if(getBroswerVersion()){
        if (PeerConnection) {
            var pcPeerConnection;
            try {
                    pcPeerConnection = new PeerConnection(iceServer);
                    pcPeerConnection.close();
                    pcPeerConnection=null;
                    return true;
                } catch (e) {
                    pcPeerConnection=null;
                    return false;
                }
    
        } else {
            return false;
        }
    } else{
        return false;
    }  
};

/*************************屏幕共享*******************************/
webrtc.prototype.shareScreen=function (parentId) {
    var screen = new Screen(parentId);

    screen.onaddstream = function(e) {
        var newVideo = document.createElement("video"),
            id = "shareScreen";
        var videos = document.getElementById(parentId);
        newVideo.setAttribute("autoplay", "");
        newVideo.setAttribute('playsinline', "");
        newVideo.setAttribute("id", id);
        newVideo.setAttribute("src", e.video);
        videos.appendChild(newVideo);
    };
    screen.openSignalingChannel = function(callback) {
        return this.socket.send('message', callback);
    };

    screen.check();


    screen.share('screen name');

}



/*************************流处理部分*******************************/


//创建本地流
webrtc.prototype.createStream = function (videoid, deviceObj) {
    console.log("createStream:",videoid,deviceObj)
    //log(this.connections);
    var that = this;
    var options = {},
        width, height, fpsctrl;
    if (deviceObj) {
        width = deviceObj.width || this.videowidth;
        height = deviceObj.height || this.videoheight;
        fpsctrl = deviceObj.fpsctrl || this.videofps;
    } else {
        width = this.videowidth;
        height = this.videoheight;
        fpsctrl = this.videofps;
    }
    sessionStorage.setItem('vwidth', width)
    sessionStorage.setItem('vheight', height)
    console.log('摄像头打开信息，分辨率w:' + width + '；分辨率h：' + height);

    options.audio = that.is_open_microphone;

    function getSupportedConstraints(model) {
        var did ='';
        if (deviceObj && deviceObj.cameraId) {
            did = {exact: deviceObj.cameraId}
        } else {
            did = undefined;
        }
        options.video = {
            deviceId: did
        }
        if (model == "standard") {
            if (Object.assign) {
                Object.assign(options.video, {
                    height: height,
                    width: width,
                    frameRate: {ideal: fpsctrl, min:10}
                });
            } else {
                options.video.height = height;
                options.video.width = width;
                options.video.frameRate = {ideal: fpsctrl, min:10};
            }
        } else if (model == "mandatory"){
            if (Object.assign) {
                Object.assign(options.video, {
                    mandatory: {
                        minWidth: width,
                        maxWidth: width,
                        minHeight: height,
                        maxHeight: height,
                        minFrameRate: fpsctrl,
                        maxFrameRate: fpsctrl
                    }
                });
            } else {
                options.video.minWidth = width;
                options.video.maxWidth = width;
                options.video.minHeight = height;
                options.video.maxHeight = height;
                options.video.minFrameRate = fpsctrl;
                options.video.maxFrameRate = fpsctrl;
            }
        } else {
            options.video = true;
        }
    }

    if (getUserMedia) {
        /**
         *  尝试打开自己
         */
        function open_oneself(model) {
            getSupportedConstraints(model);
            log('getUserMedia options config :' + JSON.stringify(options));

            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                log("navigator.mediaDevices.getUserMedia");
                navigator.mediaDevices.getUserMedia(options).then(function (stream) {
                    that.localMediaStream = stream;
                    that.initializedStreams++;
                    log('My own video stream opened successfully')
                    that.emit("stream_created", stream);
                }).catch(function (error) {
                    console.log('video stream opened fail: ', error);
                    log('video stream opened fail:' + JSON.stringify(error));
                    if (model == "standard") {
                        open_oneself("mandatory");
                    } else if (model == "mandatory"){
                        open_oneself();
                    }
                });
            }else if (navigator.webkitGetUserMedia) {
                log("webkitGetUserMedia");
                try {
                    navigator.webkitGetUserMedia(options,
                        function (stream) {
                            that.localMediaStream = stream;
                            that.initializedStreams++;
                            log('My own video stream opened successfully')
                            that.emit("stream_created", stream);
                        },
                        function (e) {
                            console.log(e)
                        }
                    );
                } catch (error) {
                    console.log('video stream opened fail: ', error);
                    log('video stream opened fail:' + JSON.stringify(error));
                    if (model == "standard") {
                        open_oneself("mandatory");
                    } else if (model == "mandatory"){
                        open_oneself();
                    }
                }
            } else if (navigator.getUserMedia){
                console.info(options);
                log("navigator.getUserMedia");
                navigator.getUserMedia(options,
                    function (stream) {
                        that.localMediaStream = stream;
                        that.initializedStreams++;
                        log('My own video stream opened successfully')
                        that.emit("stream_created", stream);
                    }, function (error) {
                        console.log('video stream opened fail: ', error);
                        log('video stream opened fail:' + JSON.stringify(error));
                        if (model == "standard") {
                            open_oneself("mandatory");
                        } else if (model == "mandatory"){
                            open_oneself();
                        }
                    });
            } 
        }
        open_oneself("standard");
    } else {
        log('error getUserMedia');
    }
};


//将本地流添加到所有的PeerConnection实例中
webrtc.prototype.addStreams = function (socketId, streamtype) {
    var that = this;
    if (streamtype == 1) {
        //上行
        var timer_handle = setInterval(function () {
            if (that.localMediaStream) {
                clearInterval(timer_handle);
                log('uplink add stream')
                that.peerConnections[socketId].addStream(that.localMediaStream);
                that.sendOffers(socketId, streamtype);
            }
        }, 100);
    } else {
        //下行
        var timer_handle = setInterval(function () {
            if (that.localMediaStream) {
                clearInterval(timer_handle);
                var NewStream = null
                if (window.MediaStream) {
                    NewStream = new MediaStream();
                } else if (webkitMediaStream) {
                    NewStream = new webkitMediaStream();
                }
                log(' downside add stream')
                that.peerConnections[socketId].addStream(NewStream);
                that.sendOffers(socketId, streamtype);
            }
        }, 100);

    }

};


//将流绑定到video标签上用于输出
webrtc.prototype.attachStream = function (stream, domId) {
    window.sstream = stream
    var svs = stream.getVideoTracks()[0]
    try {
        var svsg = svs.getSettings()
        var vsframeRate = svsg.frameRate
        var vsaspectRatio = svsg.aspectRatio
        var vsheight = svsg.height
        var vswidth = svsg.width
    } catch (e) {

    }
    var that = this;
    var element = document.getElementById(domId);
    if (!element) {
        log('error You can not find the video tag');
        return false;
    }

    if (element.className === 'my') {
        console.log("sssssss---")
        if (this.system === 'ios') {
            //自己ios的只引入 第一路视频流，不引入音频流
            try {
                var iosNewStream = null
                var NewStream = null
                if (window.MediaStream) {
                    iosNewStream = new MediaStream();
                } else if (webkitMediaStream) {
                    iosNewStream = new webkitMediaStream();
                }
                iosNewStream.addTrack(stream.getVideoTracks()[0])
                element.srcObject = iosNewStream;
            } catch (e) {
                alert(e)
            }
        } else {
            element.src = URL.createObjectURL(stream);
        }
        //自己的音量调成0
        element.volume = 0;
        //自己音量调为静音
        element.muted = false;
        //镜像180度Y轴
        // element.style.transform = " rotateY(180deg)";
    } else {
        if (vswidth && vsheight) {
            sessionStorage.setItem('vswidth', vswidth)
            sessionStorage.setItem('vsheight', vsheight)
        }
        if (this.system === 'ios') {
            element.srcObject = stream;
        } else {

            element.src = URL.createObjectURL(stream);

        }
    }


    element.addEventListener('canplaythrough', function () {
        log('create video (video id = ' + domId + ') succeed')
    });
};


/***********************信令交换部分*******************************/


//向所有PeerConnection发送Offer类型信令
webrtc.prototype.sendOffers = function (socketId, streamtype) {
    if (streamtype == 2) return false;
    var i, m,
        pc,
        that = this,
        Jsonbuf = {};
    pcCreateOfferCbGen = function (pc, socketId) {
        return function (session_desc) {
            pc.setLocalDescription(session_desc);
            Jsonbuf = session_desc;
            that.emit("offer", Jsonbuf, socketId, streamtype);
            log('send offer success peerid :' + socketId);
            // log(JSON.stringify(Jsonbuf));
        };
    };
    pcCreateOfferErrorCb = function (error) {
        log('send offer error:' + error);
        console.log(error);
    };
    pc = this.peerConnections[socketId];
    pc.createOffer(pcCreateOfferCbGen(pc, socketId), pcCreateOfferErrorCb);
};


//发送answer类型信令
// webrtc.prototype.sendAnswer = function (socketId, sdp) {
//     var pc = this.peerConnections[socketId];
//     var that = this;
//     pc.setRemoteDescription(new nativeRTCSessionDescription(sdp),function () {
//         console.info("创建setRemoteDescription成功1")
//     },function (error) {
//         console.info("创建setRemoteDescription失败1")
//     });
//     pc.createAnswer(function (session_desc) {
//         console.info("创建anser成功1")
//         pc.setLocalDescription(session_desc);
//         that.emit("answer", session_desc, socketId, 2);
//         // that.socket.send(JSON.stringify({
//         //     "eventName": "__answer",
//         //     "data": {
//         //         "socketId": socketId,
//         //         "sdp": session_desc
//         //     }
//         // }));
//     }, function (error) {
//         console.info("创建anser失败1")
//         console.log(error);
//     });
// };


webrtc.prototype.updatebrandwidth = function (socketId, bandwidth) {
    var pc1;
    pc1 = this.peerConnections[socketId];
    if (!pc1) return;
    pc1.createOffer().then(function (offer) {
        return pc1.setLocalDescription(offer);
    }).then(function () {
        var desc = {
            type: pc1.remoteDescription.type,
            sdp: updateBandwidthRestriction(pc1.remoteDescription.sdp, bandwidth)
        };
        return pc1.setRemoteDescription(desc);
    }).then(function () {

    }).catch();
}

function updateBandwidthRestriction(sdp, bandwidth) {
    var modifier = 'AS';
    // if (adapter.browserDetails.browser === 'firefox') {
    //     bandwidth = (bandwidth >>> 0) * 1000;
    //     modifier = 'TIAS';
    // }
    if (sdp.indexOf('b=' + modifier + ':') === -1) {
        // insert b= after c= line.
        sdp = sdp.replace(/c=IN (.*)\r\n/,
            'c=IN $1\r\nb=' + modifier + ':' + bandwidth + '\r\n');
    } else {
        sdp = sdp.replace(new RegExp('b=' + modifier + ':.*\r\n'),
            'b=' + modifier + ':' + bandwidth + '\r\n');
    }
    log('更新码率' + bandwidth);
    return sdp;
}

//接收到Offer类型信令后作为回应返回answer类型信令
webrtc.prototype.receiveOffer = function (socketId, sdp) {
    var pc = this.peerConnections[socketId];
    this.sendAnswer(socketId, sdp);
};

//发送answer类型信令
webrtc.prototype.sendAnswer = function (socketId, sdp) {
    var pc = this.peerConnections[socketId];
    var that = this;
    var obj = {};
    obj.type = 'offer';
    // obj.type = 'answer';
    obj.sdp = sdp;
    console.info("sdp"+sdp)
    pc.setRemoteDescription(new nativeRTCSessionDescription(obj),function () {
        console.info("创建setRemoteDescription成功2")
    },function (error) {
        console.info("创建setRemoteDescription失败2");
        console.info(error);
    });
    pc.createAnswer(function (session_desc) {
        console.info("创建anser成功2")
        pc.setLocalDescription(session_desc);
        that.emit("answer", session_desc, socketId, 2);
        log('send answer peerid：' + socketId);
        // that.socket.send(JSON.stringify({
        //     "eventName": "__answer",
        //     "data": {
        //         "socketId": socketId,
        //         "sdp": session_desc
        //     }
        // }));
    }, function (error) {
        console.info("创建anser失败2")
        console.log(error);
    });
};

//接收到answer类型信令后将对方的session描述写入PeerConnection中
webrtc.prototype.receiveAnswer = function (socketId, sdp) {
    var pc = this.peerConnections[socketId];
    if (!pc) return false;
    var obj = {};
    obj.type = 'answer';
    obj.sdp = sdp;
    // log('anser' + JSON.stringify(obj));
    pc.setRemoteDescription(new nativeRTCSessionDescription(obj));
};


/***********************点对点连接部分*****************************/


//创建与其他用户连接的PeerConnections
webrtc.prototype.createPeerConnections = function () {
    var i, m;
    for (i = 0, m = this.connections.length; i < m; i++) {
        this.createPeerConnection(this.connections[i]);
    }
};

//创建单个PeerConnection
webrtc.prototype.createPeerConnection = function (socketId, dwStreamIndex, streamtype) {
    var that = this;

    try {
        var pc = new PeerConnection(iceServer);
    } catch (e) {
        log('create peerconnection error:' + e);
        return false;
    }


    //var
    this.peerConnections[socketId] = pc;
    var data = {};
    var jsonbuf = {
        sdpMid: '',
        sdpMLineIndex: '',
        candidate: ''
    };
    pc.onicecandidate = function (evt) {
        if (typeof evt.candidate === "object") {
            try {
                jsonbuf.sdpMid = evt.candidate.sdpMid;
                jsonbuf.sdpMLineIndex = evt.candidate.sdpMLineIndex;
                jsonbuf.candidate = evt.candidate.candidate;
                jsonbuf.peerconnectionid = socketId;
                jsonbuf.streamindex = dwStreamIndex;
                jsonbuf.streamtype = streamtype;
                jsonbuf.type = 'candidate';
                // log('sendicecandidate:' + JSON.stringify(jsonbuf));
                if (evt.candidate) {
                    data.jsonbuf = jsonbuf;
                    that.socket_send('request', 0, 'webrtcconsult', data);
                }
            } catch (e) {
                // log('onicecandidate warm');
            }

        }

    };

    pc.onopen = function () {
        log('peerConnections打开成功');
        //that.emit("pc_opened", socketId, pc);
    };

    pc.onaddstream = function (evt) {
        if (streamtype == 1) {

            return false;
        }
        // log('对方流return')
        that.emit('pc_add_stream', evt.stream, socketId, pc);
    };

    pc.onremovestream = function (evt) {
        log('onremovestream')
    };

    pc.ondatachannel = function (evt) {
        // that.addDataChannel(socketId, evt.channel);
        // that.emit('pc_add_data_channel', evt.channel, socketId, pc);
    };





    pc.oniceconnectionstatechange = function () {
        // log('oniceconnectionstatechange');
    }

    pc.onidentityresult = function () {
        // log('onidentityresult')
    }

    pc.onidpassertionerror = function () {
        // log('onidpassertionerror')
    }

    pc.onidpvalidationerror = function () {
        // log('onidpvalidationerror')
    }

    pc.onnegotiationneeded = function () {
        // log('onnegotiationneeded')
    }

    pc.onpeeridentity = function () {
        // log('onpeeridentity')
    }

    pc.onsignalingstatechange = function () {
        // log('onsignalingstatechange')
    }




    return pc;
};

//关闭PeerConnection连接
webrtc.prototype.closePeerConnection = function (pc) {
    if (!pc) return;
    pc.close();
};


//关闭所有PeerConnection连接
webrtc.prototype.closeAllPeerConnection = function () {
    //this.localMediaStream.close();
    for (var connection in this.peerConnections) {
        this.peerConnections[connection].close();
        delete this.peerConnections[connection];
    }
    log('close all peerConnection');
};

//关闭其他人的connection
webrtc.prototype.closeOtherPeerConnection = function (pid) {
    //this.localMediaStream.close();
    if (this.peerConnections[pid]) {
        this.peerConnections[pid].close();
        delete this.peerConnections[pid];
    }

    log('close other peerConnection:' + pid);
};

//移除所有的标签
webrtc.prototype.removeVideo = function () {
    var list = document.querySelectorAll('video.my,video.other');
    for (var li in list) {
        if (!isNaN(li)) {
            removeElement(list[li]);
        }
    }
    log('remove All video label');

    function removeElement(_element) {
        var _parentElement = _element.parentNode;
        if (_parentElement) {
            _parentElement.removeChild(_element);
        }
    }
};

//移除自己的标签
webrtc.prototype.removeMyVideo = function () {
    var list = document.querySelectorAll('video.my');
    for (var li in list) {
        removeElement(list[li]);
    }
    log('remove my video label');

    function removeElement(_element) {
        var _parentElement = _element.parentNode;
        if (_parentElement) {
            _parentElement.removeChild(_element);
        }
    }
};

//移除他人的video 标签
webrtc.prototype.removeOtherVideo = function (pid) {
    var list = document.querySelectorAll('video.other');
    for (var li in list) {
        if (!isNaN(li)) {
            if (list[li].getAttribute('name') == pid) {
                removeElement(list[li]);
            }
        }
    }
    log('remove other video label：' + pid);

    function removeElement(_element) {
        var _parentElement = _element.parentNode;
        if (_parentElement) {
            _parentElement.removeChild(_element);
        }
    }
};

//接收候选者
webrtc.prototype.candidate = function (data) {
    // log(JSON.stringify(data));
    var pc = this.peerConnections[data.peerconnectionid];
    if (!pc) return false;

    // log('receiveicecandidate:' + JSON.stringify(data));
    try {
        var candidate = new nativeRTCIceCandidate(data);
        pc.addIceCandidate(candidate);
    } catch (e) {
        pc.addIceCandidate(data);
    }
};




exports.instance = webrtc;