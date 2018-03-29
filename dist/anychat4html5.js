/*! Copyright (c) 2005--2017 BaiRuiTech.Co.Ltd. All rights reserved. */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	window.AnyChatSDKVersion = "V1.0.0 buildtime: 2018-3-29 11:33:50 commit: 2c2f087b20d6e41f0d0f6bb3f6ea4ef8f0d2f1a0"
	/**
	 * Created by fanyongsheng on 2017/7/10.
	 */
	var _anychat = __webpack_require__(1);
	var log_obj  = __webpack_require__(8);
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


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by fanyongsheng on 2017/7/10.
	 */
	/**********************************************************/
	/*                                                        */
	/*                       anychatsdk obj                    */
	/*                                                        */
	/**********************************************************/

	var webrtc = __webpack_require__(2);
	var heartbeat_module = __webpack_require__(5);
	var object_o = __webpack_require__(6);
	var private_fuc_module = __webpack_require__(7);
	var data_package = __webpack_require__(3);
	var config = __webpack_require__(4);
	// var MediaStreamRecorder = require('./record.js');
	// var upload_record = require('./upload_record.js')
	var URL = (window.URL || window.webkitURL || window.msURL || window.oURL);
	var _export = {}; //方法集
	var getway = null; // wertc+socket 全局对象
	var AnyChatSDK = function () {
	    if (_export.Connect) return _export;
	    // var record = MediaStreamRecorder.MediaStreamRecorder; //录像方法
	    getway = new webrtc.instance();
	    var object_control = new object_o(getway);
	    data_package.setWay(getway);
	    //判断是否支持webrtc

	    var friends_id_list = []; //好友列表
	    var friends_userinfo_obj = {}; //好友信息对象
	    friends_userinfo_obj[-1] = {};
	    var exVideoArray = []; //存储视频设备
	    var exAudioArray = []; //存储音频设备
	    var exVideoAudioReverse = {}; //存储视频设备反转
	    var videoStream = []; //视频流
	    var platform_type = 0; //1:window ,2:android ,3 ios
	    var my_sdp = '';
	    var my_peerconnection = '';

	    var private_fuc = private_fuc_module.instance(getway);
	    getway.system = private_fuc.system_s();
	    platform_type = private_fuc.system_s(1);
	    log('system：' + getway.system);



	    if (!getway.support()) {
	        log('error do not support the webrtc');
	        return false;
	    }

	    /**
	     *  数据标志
	     *   CallBackFuc.OnNotifyMessage
	     */


	    var flag = {};
	    flag.connect = false;
	    /**
	     *  说明
	     *   CallBackFuc.OnNotifyMessage
	     */
	    var CallBackFuc = {};

	    /**
	     *  数据保存
	     *  info.login;
	     *  info.device_once 请求次数;
	     *  info.dwStreamIndex 视频流 【】
	     *  info.UserCameraControlExData 打开扩展摄像头数据缓存
	     *  info.loginData 保存登录信息
	     *  info.setvideoposData [];
	     *  info.SetSDKOptionStringArr [];
	     *  info.SetSDKOptionIntArr [];
	     *  info.setMyvideoposData 自己的videopos 缓存数据
	     */
	    var info = {};
	    info.setvideoposData = [];
	    info.SetSDKOptionStringArr = [];
	    info.SetSDKOptionIntArr = [];
	    info.connectaddr; //链接ip和端口

	    // 设置流
	    info.streamindex_video = {};

	    //初始化逻辑
	    function InitSDK(msg) {
	        //初始化逻辑

	    }

	    //链接
	    function Connect(lpServerAddr, dwPort) {
	        var ip = lpServerAddr + ':' + dwPort;
	        var arr = [];
	        arr.push(ip);
	        info.addr = arr;
	        getway.sessionid = null;
	        getway.connect(arr);
	        info.connectaddr = ip
	        log('Invoke	Connect(' + lpServerAddr + ',' + dwPort + ')=0')
	        return 0;
	        log('正在链接:' + lpServerAddr + ':' + dwPort);
	    }


	    //登录
	    function Login(lpUserName, lpPassword, dwParam) {

	        if (private_fuc.getStringLength(lpUserName) > 200 || private_fuc.getStringLength(lpUserName) == 0) {
	            return 21
	        }


	        var data = {};
	        data.username = lpUserName;
	        data.password = lpPassword;
	        data.passenctype = dwParam;
	        data.platformtype = platform_type;

	        if (data.username) {
	            getway.socket_send('request', 0, 'login', data);
	        }

	        if (!flag.connect) {
	            info.loginData = {};
	            info.loginData = data;
	        } else {

	        }

	        friends_userinfo_obj[-1].username = lpUserName;
	        return 0;
	    }

	    //登录（扩展）
	    function LoginEx(lpNickName, dwUserId, lpStrUserId, lpAppId, dwTimeStamp, lpSigStr, lpStrParam) {
	        if (private_fuc.getStringLength(lpNickName) > 200 || private_fuc.getStringLength(lpNickName) == 0) {
	            return 21
	        }


	        var data = {};
	        data.nickname = lpNickName;
	        data.userid = dwUserId;
	        data.struserid = lpStrUserId;
	        data.appid = lpAppId;
	        data.timestamp = dwTimeStamp;
	        data.lpSigStr = lpSigStr;
	        data.lpStrParam = lpStrParam;
	        data.platformtype = platform_type;
	        getway.socket_send('request', 0, 'loginex', data);

	        // if (!flag.connect) {
	        //     info.loginData = {};
	        //     info.loginData = data;
	        // } else {

	        // }

	        friends_userinfo_obj[-1].username = lpNickName;
	        return 0;
	    }


	    //进房间
	    function EnterRoom(dwRoomid, lpRoomPass, dwParam) {

	        var data = {};
	        data.roomid = dwRoomid;
	        data.roompass = lpRoomPass;
	        data.passenctype = dwParam;

	        if (getway.userid === -1) {
	            return 307;
	        }
	        getway.socket_send('request', 0, 'enterroom', data);
	        return 0;
	    }


	    //进房间（扩展）
	    function EnterRoomEx(lpRoomName, lpRoomPass) {
	        var data = {};
	        if (lpRoomName == undefined) lpRoomName = '';
	        if (lpRoomPass == undefined) lpRoomPass = '';
	        data.roomname = lpRoomName + '';
	        data.roompass = lpRoomPass + '';
	        data.passenctype = '';
	        if (getway.userid === -1) {
	            return 307;
	        }
	        getway.socket_send('request', 0, 'enterroomex', data);
	        return 0;
	    }


	    //离开房间
	    function leaveroom(roomid) {
	        var data = {};
	        if (!getway.roomid) {
	            log('error failure to leave the room');
	            return 20;
	        }


	        roomid || (roomid = -1);
	        data.roomid = roomid;
	        getway.socket_send('request', 0, 'leaveroom', data);
	        private_fuc.closeAll(videoStream);
	        getway.roomid = 0;
	        getway.userlist = [];

	        return 0;
	    }

	    //发送透明通道
	    function TransBuffer(dwUserId, lpBuf) {
	        var data = {};
	        data.userid = dwUserId;
	        if (!lpBuf || !dwUserId) return 9;
	        data.jsonbuf = lpBuf;
	        getway.socket_send('request', 0, 'transbuffer', data);
	        return 0;
	    }

	    //发送透明通道扩展方法
	    function TransBufferEx(dwUserId, lpBuf, wParam, lParam, dwFlags) {
	        var data = {};
	        data.userid = dwUserId;

	        if (!lpBuf || !dwUserId) return 9;
	        data.jsonbuf = lpBuf;
	        data.param1 = wParam;
	        data.param2 = lParam;
	        data.flags = dwFlags
	        getway.socket_send('request', 0, 'transbufferex', data);

	        return 0;
	    }

	    //注销
	    function Logout() {
	        var data = {};
	        log('Invoke	Logout()');
	        getway.socket_send('request', 0, 'logout', data);
	        return 0;
	    }


	    // 视频呼叫事件控制（请求、回复、挂断等）
	    function VideoCallControl(dwEventType, dwUserId, dwErrorCode, dwFlags, dwParam, szUserStr) {
	        var data = {};
	        data.eventtype = dwEventType;
	        data.userid = dwUserId;
	        data.errorcode = dwErrorCode;
	        data.flags = dwFlags;
	        data.param = dwParam;
	        data.userstr = szUserStr;
	        // data.userstr = btoa(szUserStr);
	        log('videoCallControl：' + szUserStr + '-' + data.userstr);
	        getway.socket_send('request', 0, 'videocallcontrol', data);
	    }



	    // 设置业务对象参数值
	    function SetObjectStringValue(dwObjectType, dwObjectId, dwInfoName, value) {
	        var data = {};
	        data.objecttype = dwObjectType;
	        data.objectid = dwObjectId;
	        data.infoname = dwInfoName;
	        data.infovalue = value;
	        data.valuetype = 1; // string
	        getway.socket_send('request', 0, 'objectsetvalue', data);
	    }
	    // 设置业务对象参数值
	    function SetObjectIntValue(dwObjectType, dwObjectId, dwInfoName, value) {
	        var data = {};
	        data.objecttype = dwObjectType;
	        data.objectid = dwObjectId;
	        data.infoname = dwInfoName;
	        data.infovalue = value;
	        data.valuetype = 0; //timer_handle
	        getway.socket_send('request', 0, 'objectsetvalue', data);
	    }

	    //获取业务对象参数值
	    function GetObjectIntValue(dwObjectType, dwObjectId, dwInfoName) {
	        var data = {};
	        data.objecttype = dwObjectType;
	        data.objectid = dwObjectId;
	        data.infoname = dwInfoName;
	        getway.socket_send('request', 0, 'objectgetvalue', data);
	        return object_control.GetObjectIntValue(dwObjectType, dwObjectId, dwInfoName);
	    }

	    //获取业务对象参数值
	    function GetObjectStringValue(dwObjectType, dwObjectId, dwInfoName) {
	        var data = {};
	        data.objecttype = dwObjectType;
	        data.objectid = dwObjectId;
	        data.infoname = dwInfoName;
	        getway.socket_send('request', 0, 'objectgetvalue', data);
	        return object_control.GetObjectStringValue(dwObjectType, dwObjectId, dwInfoName);
	    }


	    //业务对象控制
	    function ObjectControl(dwObjectType, dwObjectId, dwCtrlCode, dwParam1, dwParam2, dwParam3, dwParam4, strParam) {
	        var data = {};
	        data.objecttype = dwObjectType;
	        data.objectid = dwObjectId;

	        if (dwCtrlCode == 501) {
	            getway.queueId = dwObjectId;
	        } else if (dwCtrlCode == 502) {
	            data.objectid = getway.queueId;
	        }

	        data.ctrlcode = dwCtrlCode;
	        data.param1 = dwParam1;
	        data.param2 = dwParam2;
	        data.param3 = dwParam3;
	        data.param4 = dwParam4;
	        data.strparam = strParam;
	        getway.socket_send('request', 0, 'objectcontrol', data);
	        if (dwCtrlCode == 502) {
	            return 0;
	        }

	    }

	    //获取业务对象ID列表（返回一个ObjectId的数组）
	    function ObjectGetIdList(dwObjectType) {
	        var data = {};
	        data.objecttype = dwObjectType;
	        getway.socket_send('request', 0, 'objectgetidlist', data);
	        return object_control.ObjectGetIdList(dwObjectType);
	    }

	    info.SetSDKOptionString = [];
	    //系统全局设置字符串
	    function SetSDKOptionString(optname, value) {
	        var data = {};
	        data.optname = optname;
	        data.optval = value;

	        if (optname == 135) {
	            //写日志
	            log(value);
	            return 0
	        }

	        if (flag.connect) {
	            getway.socket_send('request', 0, 'setsdkoptionstring', data);
	        } else {
	            info.SetSDKOptionStringArr.push(data);
	        }
	    }


	    info.SetSDKOptionInt = [];
	    //系统全局设置整型
	    function SetSDKOptionInt(optname, value) {
	        var data = {};
	        data.optname = optname;
	        data.optval = value;

	        if (flag.connect) {
	            getway.socket_send('request', 0, 'setsdkoptionint', data);
	        } else {
	            info.SetSDKOptionIntArr.push(data);
	        }
	    }


	    //获取sdkoption 值
	    function GetSDKOptionString(optname) {
	        var data = {};
	        data.optname = optname;
	        getway.socket_send('request', 0, 'getsdkoptionstring', data);
	        return private_fuc.GetSDKOptionString(optname);
	    }

	    //获取sdkoption 值
	    function GetSDKOptionInt(optname) {
	        var data = {};
	        data.optname = optname;
	        getway.socket_send('request', 0, 'getsdkoptionint', data);
	    }



	    // 操作本地用户视频（或请求远程用户视频）
	    function UserCameraControl(dwUserId, bOpen) {
	        var data = {};
	        data.userid = dwUserId;
	        data.open = bOpen;
	        return UserCameraControlEx(dwUserId, bOpen, 0, 0, '');
	        //private_fuc.createStream(exVideoArray[0]);
	        // getway.socket_send('request', 0, 'usercameracontrol', data);
	    }

	    // 操作本地用户视频（或请求远程用户视频）扩展方法
	    function UserCameraControlEx(dwUserId, bOpen, dwStreamIndex, dwFlags, szStrParam) {
	        if (!getway.roomid) { return 3; }
	        log('Invoke UserCameraControlEx(' + dwUserId + ',' + bOpen + ',' + dwStreamIndex + ', ' + dwFlags + ', ' + szStrParam + ')');
	        var user_room_list = getway.userlist;
	        // if(user_room_list.indexOf(dwUserId)<0 && dwUserId!=-1){log('请求视频的userid有误,此userid并不在房间内');return 309}
	        if (!dwUserId) { return 309; }
	        // log('UserCameraControlEx(' + dwUserId + ',' + bOpen + ', ' + dwStreamIndex + ', ' + dwFlags + ', ' + szStrParam + ')');
	        var data = {};
	        data.userid = dwUserId;
	        data.open = bOpen;
	        data.streamindex = dwStreamIndex;
	        data.flags = dwFlags;

	        //打开摄像头流start
	        var streamindex_video = info.streamindex_video;
	        var deviceName = '';
	        var deviceObj;

	        if (dwUserId == -1 || dwUserId == getway.userid) {
	            //打开自己
	            log('outputStreamInfo:' + JSON.stringify(streamindex_video));
	            if (streamindex_video[dwStreamIndex]) {
	                deviceName = streamindex_video[dwStreamIndex].cameraName;
	                var cameraId = DeviceNameMapping(deviceName)
	                deviceObj = streamindex_video[dwStreamIndex];
	                deviceObj.cameraId = cameraId
	            } else {
	                BRAC_SetUserStreamInfo(-1, 0, BRAC_SO_LOCALVIDEO_DEVICENAME, '');
	            }


	            if (bOpen == 0) {
	                //关闭自己摄像头
	                private_fuc.closeMyCamera(videoStream);
	                friends_userinfo_obj['-1'].camerastate = 1;
	                friends_userinfo_obj[getway.userid].camerastate = 1;
	            } else {
	                var obj
	                if (deviceName) {
	                    obj = ByDevicesNameGetObj(deviceName);
	                }

	                private_fuc.createStream(obj, deviceObj);
	                var strparam = {}
	                var peerId = getway.sessionid + '_' + dwUserId + '_' + dwStreamIndex;
	                log('open my camera peerid：' + peerId);
	                var setvideoData = {};
	                setvideoData.peerId = peerId;
	                setvideoData.userId = dwUserId;
	                setvideoData.streamIndex = dwStreamIndex;
	                setvideoData.streamtype = 1;
	                info.setvideoposData[peerId] = setvideoData;
	                //peerconnection

	                getway.createPeerConnection(peerId, dwStreamIndex, 1);
	                getway.addStreams(peerId, 1);

	                strparam.peerconnectionid = peerId;
	                strparam.streamtype = 1;
	                strparam.streamindex = dwStreamIndex;

	                data.strparam = strparam;
	            }
	        } else {
	            if (bOpen == 0) {
	                //关闭对方
	                var setvideopos_arr = info.setvideoposData;
	                var pid = 0;
	                for (var i in setvideopos_arr) {
	                    if (setvideopos_arr[i].userId == dwUserId && setvideopos_arr[i].streamIndex == dwStreamIndex) {
	                        pid = setvideopos_arr[i].peerId;
	                    }
	                }
	                if (pid != 0) {
	                    private_fuc.closeOtherCamera(pid);
	                }
	            } else {
	                //打开对方
	                var strparam = {}
	                var peerId = getway.sessionid + '_' + dwUserId + '_' + dwStreamIndex;
	                log('open other camera peerid：' + peerId);
	                var setvideoData = {};
	                setvideoData.peerId = peerId;
	                setvideoData.userId = dwUserId;
	                setvideoData.streamIndex = dwStreamIndex;
	                setvideoData.streamtype = 2;
	                info.setvideoposData[peerId] = setvideoData;
	                //peerconnection
	                getway.createPeerConnection(peerId, dwStreamIndex, 2);
	                getway.addStreams(peerId, 2);


	                strparam.peerconnectionid = peerId;
	                strparam.streamtype = 2;
	                strparam.streamindex = data.streamindex;

	                data.strparam = strparam;

	            }



	        }
	        console.log('打开摄像头' + JSON.stringify(data))
	        getway.socket_send('request', 0, 'usercameracontrolex', data);
	        return 0;
	        //打开摄像头流index

	        //var timer_handle = setInterval(function(){
	        //    if(info.offer){
	        //        data.jsonbuf = info.offer;
	        //        info.offer = '';
	        //        clearInterval(timer_handle);
	        //        getway.socket_send('request',0,'usercameracontrolex',data);
	        //    }
	        //},500);




	    }

	    // 操作本地用户语音（或请求远程用户语音）
	    function UserSpeakControl(dwUserId, bOpen) {
	        log('Invoke UserSpeakControl(' + dwUserId + ',' + bOpen + ')');
	        var data = {};

	        if (!dwUserId) {
	            return 219;
	        }

	        if (bOpen == 1) {
	            friends_userinfo_obj['-1'].speakstate = 1;
	            friends_userinfo_obj[getway.userid].speakstate = 1;
	            getway.is_open_microphone = true;
	        } else {
	            friends_userinfo_obj['-1'].speakstate = 0;
	            friends_userinfo_obj[getway.userid].speakstate = 0;
	            getway.is_open_microphone = false;
	        }


	        data.userid = dwUserId;
	        data.open = bOpen;
	        getway.socket_send('request', 0, 'userspeakcontrol', data);
	        return 0;
	    }

	    function UserSpeakControlEx(dwUserId, bOpen, dwStreamIndex, dwFlags, szStrParam) {
	        var data = {};

	        if (!dwUserId) {
	            return 219;
	        }

	        if (bOpen == 1) {
	            friends_userinfo_obj['-1'].speakstate = 1;
	            friends_userinfo_obj[getway.userid].speakstate = 1;
	            getway.is_open_microphone = true;
	        } else {
	            friends_userinfo_obj['-1'].speakstate = 0;
	            friends_userinfo_obj[getway.userid].speakstate = 0;
	            getway.is_open_microphone = false;
	        }


	        data.userid = dwUserId;
	        data.open = bOpen;
	        getway.socket_send('request', 0, 'userspeakcontrol', data);

	        return 0;
	    }



	    //发送文字信息
	    function SendTextMessage(dwUserId, bSecret, lpMsgBuf, parm) {

	        var data = {};

	        // if (!dwUserId) {
	        //     return 219;
	        // }

	        data.userid = dwUserId;
	        data.secret = bSecret;
	        data.buf = lpMsgBuf;

	        if (data.buf.length > 8000) return 712;
	        getway.socket_send('request', 0, 'sendtextmessage', data);
	        return 0;
	    }

	    //获取版本
	    function GetVersion(type) {
	        var val = '';
	        switch (type) {
	            case 1:
	                val = config.sdk_version;
	                break;
	            
	        }

	        return val;
	    }






	    // 枚举设备的数量
	    function PrepareFetchDevices(dwDeviceType) {
	        if (dwDeviceType == 1) {
	            info.device_video_once = 0;
	            return exVideoArray.length;
	        } else if (dwDeviceType == 2) {
	            info.device_audio_once = 0;
	            return exAudioArray.length;
	        }
	    }

	    function DeviceNameMapping(label) {
	        console.log("label:", label)
	        console.log("DeviceNameMapping:", exVideoArray, "exVideoAudioReverse:", exVideoAudioReverse)
	        var deviceId = "";
	        exVideoArray.forEach(function(v){
	            if (v.label == label) deviceId = v.deviceId;
	        })
	        deviceId = (deviceId ? deviceId : exVideoAudioReverse[label])
	        return deviceId;
	    }

	    // 返回设备的名称
	    function FetchNextDevice(dwDeviceType) {
	        if (dwDeviceType == 1) {
	            var obj = exVideoArray[info.device_video_once++];
	            return obj.label;
	        } else if (dwDeviceType == 2) {
	            var obj = exAudioArray[info.device_audio_once++];
	            return obj.label;
	        }

	    }


	    function SetUserStreamInfoString(dwUserId, dwStreamIndex, infoname, value) {
	        if (infoname == BRAC_SO_LOCALVIDEO_BITRATECTRL && my_peerconnection) {
	            getway.updatebrandwidth(my_peerconnection, value);
	        }
	        info.streamindex_video = private_fuc.strema_video(info, dwStreamIndex, infoname, value);
	    }

	    function SetUserStreamInfoInt(dwUserId, dwStreamIndex, infoname, value) {

	        info.streamindex_video = private_fuc.strema_video(info, dwStreamIndex, infoname, value);
	    }


	    //获取房间用户列表数组
	    function GetRoomOnlineUsers(index) {
	        var list;
	        if (index == -1) {
	            list = getway.userlist.filter(function () {
	                return true;
	            })
	            return list;
	        }
	        return [];
	    }

	    //获取当前设备
	    function GetCurrentDevice(type) {
	        if (type == 1) {
	            //视频采集设备


	        } else if (type == 2) {
	            //音频采集设备


	        } else if (type == 3) {
	            //扬声器采集设备


	        }
	    }

	    // 查询指定用户相关状态（整型值状态）
	    function QueryUserStateInt(dwUserId, infoname) {
	        if (infoname == 1) {
	            //查询指定用户摄像头状态
	            if (dwUserId == -1 || dwUserId == getway.userid) {
	                if (getway.localMediaStream) {
	                    return 2;
	                } else {
	                    return 1;
	                }
	            }
	            return friends_userinfo_obj[dwUserId].camerastate;
	        }


	        if (infoname == 2) {
	            //查询指定用户摄像头状态
	            if (dwUserId == -1 || dwUserId == getway.userid) {
	                if (getway.localMediaStream) {
	                    return friends_userinfo_obj[-1].speakstate;
	                } else {
	                    return 0;
	                }
	            }
	            return friends_userinfo_obj[dwUserId].speakstate;
	        }

	        if (infoname == 13) {
	            //查询指定用户摄像头分辨率
	            if (dwUserId == -1 || dwUserId == getway.userid) {
	                return {
	                    width: sessionStorage.getItem('vwidth'),
	                    height: sessionStorage.getItem('vheight')
	                }
	            } else {
	                return {
	                    width: sessionStorage.getItem('vswidth') || getway.videowidth,
	                    height: sessionStorage.getItem('vsheight') || getway.videoheight
	                }
	            }
	        }

	        return 0;
	    }


	    //获取好友列表
	    function GetUserFriends() {
	        return friends_id_list;
	    }


	    //获取用户信息
	    function GetUserInfo(dwUserId, dwInfoId) {
	        if (dwInfoId == 1) {
	            if (!friends_userinfo_obj[dwUserId]) return undefined;
	            return friends_userinfo_obj[dwUserId].username;
	        }

	        if (dwInfoId == 2) {
	            if (!friends_userinfo_obj[dwUserId]) return undefined;
	            return friends_userinfo_obj[dwUserId].userip;
	        }
	    }

	    //获取好友状态
	    function GetFriendStatus(dwUserId) {
	        if (friends_userinfo_obj[dwUserId]) {
	            return friends_userinfo_obj[dwUserId].status;
	        } else {
	            return 0;
	        }
	    }

	    //获取好友信息
	    function QueryInfoFromServer(dwInfoName, lpInParam) {
	        if (dwInfoName == 1) {
	            for (var userid in friends_userinfo_obj) {
	                if (friends_userinfo_obj[userid].username === lpInParam) {
	                    return userid;
	                }
	            }
	        }
	        return undefined;
	    }


	    //使用userid 获取用户信息
	    function QueryUserStateString(dwUserId, lpInParam) {

	        if (lpInParam == 6) {
	            //获取用户昵称
	            if (friends_userinfo_obj[dwUserId]) {
	                return friends_userinfo_obj[dwUserId].username;
	            } else {
	                return undefined;
	            }
	        }

	        return undefined;
	    }


	    //录像
	    var mediaRecorder;

	    function StreamRecordCtrl(dwUserId, bStartRecord, dwFlags, dwParam) {
	        if (dwUserId == -1 || dwUserId == getway.userId) {
	            if (bStartRecord == 1) {
	                if (videoStream[0]) {
	                    mediaRecorder = new record(videoStream[0]);
	                    // mediaRecorder.mimeType = 'video/webm';

	                    mediaRecorder.ondataavailable = function (blob) {
	                        consonsole.log('生成blob');
	                        // upload_record.upload("blob", blob, "lnjnkj.webm");

	                        // POST/PUT "Blob" using FormData/XHR2
	                        var blobURL = URL.createObjectURL(blob);

	                        CallBackFuc.OnRecordSnapShotEx2(dwUserId, 0, blobURL, 0, 0, 0, '');
	                        // document.write('<a href="' + blobURL + '">' + blobURL + '</a>');
	                    };
	                    mediaRecorder.start(300000);
	                    return 0;
	                } else {
	                    return 200; //还没有流
	                }
	            } else if (bStartRecord == 0) {
	                mediaRecorder.stop();
	                return 0;
	            }

	            return 0;
	        }
	    }

	    function StreamRecordCtrlEx(dwUserId, bStartRecord, dwFlags, dwParam, lpUserStr) {
	        var data = {};
	        data.userid = dwUserId;
	        data.startrecord = bStartRecord;
	        data.flags = dwFlags;
	        data.param = dwParam;
	        data.userstr = lpUserStr;
	        log('Invoke StreamRecordCtrlEx('+dwUserId+','+ bStartRecord+','+ dwFlags+','+ dwParam+','+ lpUserStr+')');
	        if(bStartRecord != 0 && bStartRecord != 1) return 21

	        // flags 0x00000004 服务器
	        if ((dwFlags & 0x00000400) > 0 && (dwFlags & 0x00000004 == 0)) {
	            //拍照 0x00000400
	            return SnapShot(dwUserId, dwFlags, dwParam);
	        }
	        if (dwFlags) {
	            getway.socket_send('request', 0, 'streamrecordctrlex', data);
	        }
	    }


	    // 通过设备名返回设备obj
	    function ByDevicesNameGetObj(DevicesName) {
	        for (var i in exVideoArray) {
	            if (exVideoArray[i].label == DevicesName) return exVideoArray[i]
	        }
	    }


	    // 设置视频显示位置
	    function SetVideoPos(userid, parentobj, id) {
	        if (!getway.roomid) { log('还没有进入房间'); return false; }
	        if (userid == -1 || getway.userid == userid) {
	            //return false;
	            var newVideo = document.createElement("video");
	            var videos = parentobj;
	            newVideo.setAttribute("class", "my");
	            newVideo.setAttribute("autoplay", "");
	            newVideo.setAttribute("id", id);
	            newVideo.setAttribute('playsinline', "");
	            videos.appendChild(newVideo);
	            console.log('初始化显示流');
	            info.setMyvideoposData = {
	                userid: userid,
	                parentobj: parentobj,
	                id: id
	            }
	            var timer_handle = setInterval(function () {
	                if (videoStream[0]) {
	                    clearInterval(timer_handle);
	                    getway.attachStream(videoStream[0], id);
	                }
	            }, 500)
	        } else {


	        }

	        var i = getVideoPosData(userid);
	        if (i == -1) return false;
	        info.setvideoposData[i].parentobj = parentobj;
	        info.setvideoposData[i].id = id;

	        function getVideoPosData(userid) {
	            var arr = info.setvideoposData;
	            var k;
	            for (var i in arr) {
	                if (arr[i].userId == userid) {
	                    k = i;
	                }
	            }
	            if (k) {
	                return k;
	            } else {
	                return -1;
	            }


	        }
	    }



	    //OnAnyChatNotifyMessage
	    var cmdType = {
	        "connect": WM_GV_CONNECT,
	        "login": WM_GV_LOGINSYSTEM,
	        "loginex": WM_GV_LOGINSYSTEM,
	        "enterroom": WM_GV_ENTERROOM,
	        "onlineuser": WM_GV_ONLINEUSER,
	        "linkclose": WM_GV_LINKCLOSE,
	        "useratroom": WM_GV_USERATROOM
	    };

	   /**
	     * 获取设备
	     */
	    function initDevices() {
	        exVideoArray = [];
	        exAudioArray = [];
	        if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
	            navigator.mediaDevices.enumerateDevices().then(function (devices) {
	                gotSources(devices);
	            });
	        } else {
	            MediaStreamTrack.getSources(gotSources);
	        }

	        function gotSources(sourceInfos) {
	            var camera_index = 0;
	            var mic_index = 0;
	            console.log(sourceInfos);
	            for (var i = 0; i != sourceInfos.length; ++i) {
	                var sourceInfo = sourceInfos[i];
	               
	                //这里会遍历audio,video，所以要加以区分
	                if (sourceInfo.kind === 'video' || sourceInfo.kind === 'videoinput') {
	                  
	                    if(!sourceInfo.label){
	                        var obj_camera = {};
	                        obj_camera.deviceId = sourceInfo.deviceId;
	                        obj_camera.label =  'camera_'+camera_index;
	                        console.log('camera_'+camera_index);
	                        exVideoArray.push(obj_camera);
	                        exVideoAudioReverse[obj_camera.label] = obj_camera.deviceId
	                        camera_index++;
	                        // break;
	                    }else{
	                        exVideoArray.push(sourceInfo);
	                    }
	                } else if (sourceInfo.kind === 'audio' || sourceInfo.kind === 'audioinput') {
	                    if (!sourceInfo.label && sourceInfo.deviceId != "communications" && sourceInfo.deviceId != "default") {
	                        var obj_mic = {};
	                        obj_mic.deviceId = sourceInfo.deviceId;
	                        obj_mic.label =  'micphone_'+mic_index;
	                        console.log('micphone_'+mic_index);
	                        exAudioArray.push(obj_mic);
	                        exVideoAudioReverse[obj_mic.label] = obj_mic.deviceId
	                        mic_index++;
	                    } else if (sourceInfo.label.indexOf('麦克风') != -1) {
	                        exAudioArray.push(sourceInfo);
	                    }
	                }
	            }
	        }
	    }



	    function deviceLog(label) {
	        console.log(label);
	        var text = '',
	            g = '||'
	        for (var i in label) {
	            if (i == 0) {
	                g = '';
	            } else {
	                g = '||';
	            }
	            text += (g + label[i].label);
	        }
	        log(text);
	    }


	    /**
	     * 登录后返回要把信息hold 住
	     */
	    function hold_system() {

	    }


	    /**
	     * 网关回调事件
	     */
	    function event() {
	        //链接响应 reply
	        getway.on("reply", function (data) {
	            var json = data.data,
	                cmdcode = json.cmdcode,
	                errorcode = json.errorcode,
	                wParam = '',
	                lParam = '';
	            //OnAnyChatNotifyMessage
	            if (cmdType[cmdcode]) {
	                switch (cmdcode) {
	                    case "connect":
	                        private_fuc.clear_timer();
	                        if (errorcode == 0) {
	                            flag.connect = true;
	                            private_fuc.SetSDKOptionString(info.SetSDKOptionStringArr);
	                            private_fuc.SetSDKOptionInt(info.SetSDKOptionIntArr);
	                            info.SetSDKOptionStringArr = [];
	                            info.SetSDKOptionIntArr = [];
	                            log('Message	OnConnect(errorcode=0,addr=' + info.connectaddr + ')');
	                        } else if (errorcode == 1) {
	                            //dns 链接
	                            if (json.gwaddr && json.gwport) {
	                                flag.connect = false;
	                                getway.is_socket = false;
	                                getway.socket = null;
	                                Connect(json.gwaddr, json.gwport);
	                            }
	                            return 'errorcode 1'
	                        }
	                        if (info.loginData) {
	                            var data = {};
	                            data = info.loginData;
	                            if (data.username) {
	                                getway.socket_send('request', 0, 'login', data);
	                            }
	                        }
	                        heartbeat_module.start(getway);

	                        break;
	                    case "login":
	                    case "loginex":
	                        if (errorcode == 23 || errorcode == -1) {
	                            hold_system();
	                            log('hold 住')
	                            return;
	                        }
	                        info.loginData = {};
	                        if (errorcode == 0) {
	                            // friends_userinfo_obj['-1'] = {};
	                            friends_userinfo_obj[json.userid] = {};
	                            friends_userinfo_obj['-1'].camerastate = 1;
	                            friends_userinfo_obj[json.userid].camerastate = 1;
	                            friends_userinfo_obj['-1'].speakstate = 0;
	                            friends_userinfo_obj[json.userid].speakstate = 0;
	                            log('OnLoginSystem(userid=' + json.userid + ',errorcode=' + errorcode + ')');
	                            getway.sessionid = json.sessionid;
	                            getway.userid = wParam = json.userid;
	                        } else {
	                            log('OnLoginSystem(errorcode=' + errorcode + ')');
	                            wParam = -1;
	                        }

	                        friends_userinfo_obj[json.userid].username = friends_userinfo_obj[-1].username;

	                        break;
	                    case "enterroom":
	                        if (errorcode == 0) getway.roomid = json.roomid;
	                        wParam = json.roomid;
	                        log('Message OnEnterRoom(roomid:' + wParam + ',errorcode:' + errorcode + ')');
	                        break;
	                }
	                cmdType[cmdcode] && CallBackFuc.OnNotifyMessage(cmdType[cmdcode], wParam, (lParam || errorcode));
	            }


	            //重连
	            if (cmdcode === "tokenconnect") {
	                if (errorcode == 0) {
	                    //重连成功发送;
	                    private_fuc.clear_timer();
	                    heartbeat_module.start(getway);
	                    log('重连成功');
	                } else {
	                    getway.sendData = {};
	                    getway.sessionid = null;
	                    log('重连失败');
	                }

	            }

	            //心跳
	            if (cmdcode === "heartbeat") {
	                heartbeat_module.notify(errorcode);
	            }


	            //注销
	            if (cmdcode === 'logout') {
	                log('注销成功');
	                getway.socket.close();
	                private_fuc.closeAll(videoStream);
	                heartbeat_module.stop();
	                data_package.clear_all();
	                getway.roomid = 0;
	                getway.userid = 0;
	                getway.socket = null;
	                getway.normalCloseWebsocket = true;
	            }

	        });

	        //收到的request
	        getway.on("request", function (data) {
	            var json = data.data,
	                cmdcode = json.cmdcode;

	            //重传
	            if (cmdcode === 'restrans') {
	                data_package.restrans_to_service(json.begin_reg);
	            }

	        });


	        //notify
	        getway.on("notify", function (data) {
	            var json = data.data,
	                cmdcode = json.cmdcode,
	                errorcode = json.errorcode,
	                wParam = '',
	                lParam = '';
	            //设置最大的notify
	            data_package.set_big_index_notify(data.seq);
	            if (cmdType[cmdcode]) {
	                switch (cmdcode) {
	                    case "onlineuser":
	                        var useridlist = json.useridlist;
	                        if (typeof useridlist !== "object") {
	                            useridlist = JSON.parse(useridlist);
	                            if (useridlist.userlist) {
	                                var userlist = useridlist.userlist;
	                                for (var i in userlist) {
	                                    if (!friends_userinfo_obj[userlist[i].userid]) {
	                                        friends_userinfo_obj[userlist[i].userid] = {};
	                                    }
	                                    friends_userinfo_obj[userlist[i].userid].username = userlist[i].username;
	                                    friends_userinfo_obj[userlist[i].userid].camerastate = userlist[i].camerastate;
	                                    friends_userinfo_obj[userlist[i].userid].speakstate = userlist[i].speakstate;
	                                    log('roomuser：' + userlist[i].username);
	                                }
	                            }
	                        }



	                        var arr = useridlist.useridlist;
	                        getway.userlist = arr;
	                        wParam = arr.length + 1;
	                        lParam = json.roomid;
	                        break;
	                    case "linkclose":

	                        break;
	                    case "useratroom":
	                        wParam = json.userid;
	                        if (json.benter == 1) {
	                            //进房间
	                            getway.userlist.push(wParam);
	                            if (!friends_userinfo_obj[wParam]) {
	                                friends_userinfo_obj[wParam] = {};
	                            }
	                            json.username && log('enterroom username: ' + json.username);
	                            friends_userinfo_obj[wParam].username = json.username;
	                            friends_userinfo_obj[wParam].camerastate = json.camerastate;
	                            friends_userinfo_obj[wParam].speakstate = json.speakstate;
	                        } else {
	                            //退房间
	                            private_fuc.ArrayremoveByValue(getway.userlist, wParam);
	                        }
	                        lParam = json.benter;
	                        break;

	                }
	                cmdType[cmdcode] && CallBackFuc.OnNotifyMessage(cmdType[cmdcode], wParam, (lParam || errorcode));
	            }


	            //keep 
	            if (cmdcode === 'keep') {
	                if (errorcode == 0) {
	                    getway.sessionid = json.sessionid;
	                    getway.userid = wParam = json.userid;
	                }

	                //返回给 loginsystem
	                CallBackFuc.OnNotifyMessage(WM_GV_LOGINSYSTEM, wParam, (lParam || errorcode));
	            }



	            //webrtc
	            if (cmdcode === 'webrtcconsult') {
	                if (errorcode == 0) {
	                    var jsonbuf = JSON.parse(json.jsonbuf);
	                    if (jsonbuf.type === 'answer') {
	                        log('received answer peerid：' + jsonbuf.peerconnectionid);
	                        my_sdp = jsonbuf.sdp;
	                        my_peerconnection = jsonbuf.peerconnectionid;

	                        if (getway.system === 'ios') {
	                            jsonbuf.sdp = private_fuc.setMediaBitrates(jsonbuf.sdp, 350, 30);
	                        } else {
	                            // log('answer 码率' + getway.bitrate + ' 系统：' + getway.system);
	                            jsonbuf.sdp = private_fuc.setMediaBitrates(jsonbuf.sdp, getway.bitrate, 30);
	                        }


	                        getway.receiveAnswer(jsonbuf.peerconnectionid, jsonbuf.sdp);
	                    } else if (jsonbuf.type === 'candidate') {
	                        // log('recieved candidate');
	                        getway.candidate(jsonbuf);
	                    } else if (jsonbuf.type === 'offer') {
	                        log('recieved offer peerid：' + jsonbuf.peerconnectionid);
	                        getway.sendAnswer(jsonbuf.peerconnectionid, jsonbuf.sdp);
	                    }
	                }
	            }

	            //文本信息通知
	            if (cmdcode === 'textmessage') {
	                var buf = json.msgbuf
	                CallBackFuc.OnAnyChatTextMessage(json.fromuserid, json.touserid, json.secret, buf, 0);
	            }


	            //对象通知objectcontrol
	            if (cmdcode === 'objectevent') {
	                if (json.eventtype == 0) {
	                    object_control.setObjectInfo(json);
	                } else if (json.eventtype == -1) {
	                    object_control.setObjectInfo_1(json);
	                } else {
	                    CallBackFuc.OnAnyChatObjectEvent(json.objecttype, json.objectid, json.eventtype, json.param1, json.param2, json.param3, json.param4, json.strparam);
	                }

	            }

	            //呼叫通知
	            if (cmdcode === 'videocallevent') {
	                // OnAnyChatVideoCallEvent(dwEventType, dwUserId, dwErrorCode, dwFlags,dwParam, szUserStr)

	                CallBackFuc.OnAnyChatVideoCallEvent(json.eventtype, json.userid, json.errorcode, json.flags, json.param, json.jsonbuf);
	            }

	            if (cmdcode === "transbuffer") {
	                CallBackFuc.OnAnyChatTransBuffer(json.userid, json.jsonbuf, 0);
	            }

	            //dwUserId, lpBuf, dwLen, wParam, lParam, dwTaskId
	            if (cmdcode === "transbufferex") {
	                CallBackFuc.OnAnyChatTransBufferex(json.userid, json.jsonbuf, 0, json.param1, json.param2, json.taskid);
	            }


	            //推送好友
	            if (cmdcode === 'friendstatus') {
	                CallBackFuc.OnNotifyMessage(WM_GV_FRIENDSTATUS, json.userid, json.status);
	                friends_userinfo_obj[json.userid] = json;

	                if (friends_id_list.indexOf(json.userid) < 0) {
	                    friends_id_list.push(json.userid);
	                }
	            }

	            //好友更新通知完成
	            if (cmdcode === "userinfoupdate") {
	                CallBackFuc.OnNotifyMessage(WM_GV_USERINFOUPDATE, json.userid, json.type);
	            }


	            //默认数据设置 包括码率 分辨率 帧率
	            if (cmdcode === 'appconfiginfo') {
	                if (errorcode == 0) {
	                    json.videobitrate && (getway.bitrate = json.videobitrate / 1000); //码率
	                    json.videowidth && (getway.videowidth = json.videowidth); //视频宽度
	                    json.videoheight && (getway.videoheight = json.videoheight); //视频高度
	                    json.videofps && (getway.videofps = json.videofps); //视频帧率
	                }
	            }

	            //摄像头状态改变通知
	            if (cmdcode === 'camerastate') {
	                // log('');
	                if (friends_userinfo_obj[json.userid]) friends_userinfo_obj[json.userid].camerastate = json.camerastate;

	            }

	            //摄像头状态改变通知
	            if (cmdcode === 'micstatechange') {
	                // log('');
	                if (friends_userinfo_obj[json.userid]) friends_userinfo_obj[json.userid].speakstate = json.micstate;

	            }

	            //录像回调
	            if (cmdcode === 'streamrecordctrlex') {
	                log('Message OnAnyChatRecordSnapShotEx(' + json.userid + ',' + json.filename + ',' + json.elapse + ',' + json.flags + ',' + json.param + ')');
	                CallBackFuc.OnAnyChatRecordSnapShotEx(json.userid, json.filename, json.elapse, json.flags, json.param, '');
	            }
	        });


	        getway.on("stream_created", function (stream) {
	            videoStream[0] = stream;
	            initDevices();
	        });



	        /**
	         * 网络关闭
	         */
	        getway.on("close_websocket", function (data) {
	            log('try to reconnect');
	            heartbeat_module.stop();
	            private_fuc.tokenconnect(info.addr, videoStream);
	        });

	        /**
	         * anychat网络关闭
	         */
	        getway.on('linkclose', function (errorcode) {
	            var code = WM_GV + 6;
	            CallBackFuc.OnNotifyMessage(code, 0, errorcode);
	        });

	        /**
	         * offer 发送
	         */
	        getway.on('offer', function (jsonBuf, peerconnectionid, streamtype) {
	            var data = {};
	            var obj = {};
	            var info_ = info.setvideoposData,
	                data_;
	            data_ = info_[peerconnectionid];




	            obj.type = "offer";
	            // if(streamtype==2){
	            //     obj.sdp = private_fuc.setMediaBitrates(jsonBuf.sdp, 2, 1);
	            // }else{
	            //     obj.sdp = jsonBuf.sdp;
	            // }
	            obj.sdp = jsonBuf.sdp;
	            obj.peerconnectionid = peerconnectionid;
	            obj.streamindex = data_.streamIndex;
	            obj.streamtype = data_.streamtype;
	            data.jsonbuf = obj;
	            // log(JSON.stringify(data));
	            //data.peerconnectionid = jsonBuf.peerconnectionid;
	            getway.socket_send('request', 0, 'webrtcconsult', data);
	        });


	        //发送answer
	        getway.on('answer', function (jsonBuf, peerconnectionid, streamtype) {
	            var data = {};
	            var obj = {};
	            var info_ = info.setvideoposData,
	                data_;
	            data_ = info_[peerconnectionid];



	            obj.type = "answer";

	            obj.sdp = jsonBuf.sdp;
	            obj.peerconnectionid = peerconnectionid;
	            obj.streamindex = data_.streamIndex;
	            obj.streamtype = data_.streamtype;
	            data.jsonbuf = obj;

	            getway.socket_send('request', 0, 'webrtcconsult', data);
	        });

	        /**
	         * 打开对方摄像头
	         */
	        getway.on('pc_add_stream', function (stream, sessionid) {
	            var streamIndex_arr = sessionid.split('_');
	            log('open other video stream peerid：' + sessionid);
	            var info_ = info.setvideoposData,
	                data;
	            for (var i in info_) {
	                if (info_[i].peerId == sessionid && info_[i].streamIndex == streamIndex_arr[2]) {
	                    data = info_[i];
	                }
	            }

	            if (data) {
	                var newVideo = document.createElement("video"),
	                    id = data.id;
	                var videos = data.parentobj;
	                if (data.parentobj) {
	                    newVideo.setAttribute("class", "other");
	                    newVideo.setAttribute('name', sessionid);
	                    newVideo.setAttribute("autoplay", "");
	                    newVideo.setAttribute('playsinline', "");
	                    // newVideo.setAttribute("poster", 'images/anychatbk.jpg');
	                    newVideo.setAttribute("id", id);
	                    videos.appendChild(newVideo);
	                    getway.attachStream(stream, id);
	                }
	            }
	        });

	        /**
	         * 清理seq缓存
	         */
	        getway.on('ack', function (data) {
	            data_package.delt_pack(data.seq);
	        })
	    }


	    /**
	     * 应用层事件绑定
	     * @param cmdcode
	     * @param fuc
	     */
	    function on(cmdcode, fuc) {
	        switch (cmdcode) {
	            case "OnNotifyMessage":
	                CallBackFuc.OnNotifyMessage = fuc;
	                break;
	            case "OnVideoCallEvent":
	                CallBackFuc.OnAnyChatVideoCallEvent = fuc;
	                break;
	            case "OnObjectEvent":
	                CallBackFuc.OnAnyChatObjectEvent = fuc;
	                break;
	            case "OnTextMessage":
	                CallBackFuc.OnAnyChatTextMessage = fuc;
	                break;
	            case "OnTransBuffer":
	                CallBackFuc.OnAnyChatTransBuffer = fuc;
	                break;
	            case "OnTransBufferex":
	                CallBackFuc.OnAnyChatTransBufferex = fuc;
	                break;
	            case "OnRecordSnapShotEx2":
	                CallBackFuc.OnRecordSnapShotEx2 = fuc;
	                break;
	            case "OnRecordSnapShot":
	                CallBackFuc.OnRecordSnapShot = fuc;
	                break;
	            case "OnAnyChatRecordSnapShotEx":
	                CallBackFuc.OnAnyChatRecordSnapShotEx = fuc;
	                break;
	        }

	    }

	    /**
	     * 初始化一进来就执行
	     */
	    function init() {
	        getway.browserName = private_fuc.getBrowser();
	        console.log('浏览器名字：' + getway.browserName);
	        //事件绑定
	        event();
	        //初始化设备
	        setTimeout(function () {
	            initDevices();
	        }, 1)

	    }


	    //切换摄像头
	    function SelectDevice(dwDeviceType, szCaptureName) {
	        log('SelectDevice(' + dwDeviceType + ',' + szCaptureName + ')')
	        if (dwDeviceType == 1) {
	            //摄像头切换
	            var setMyvideoposData = info.setMyvideoposData;
	            if (getway.localMediaStream) {
	                BRAC_UserCameraControl(-1, 0);
	                BRAC_SetUserStreamInfo(-1, 0, BRAC_SO_LOCALVIDEO_DEVICENAME, szCaptureName);
	                setTimeout(function () {
	                    BRAC_UserCameraControl(-1, 1);
	                    SetVideoPos(setMyvideoposData.userid, setMyvideoposData.parentobj, setMyvideoposData.id)
	                }, 1000);

	            } else {
	                BRAC_SetUserStreamInfo(-1, 0, BRAC_SO_LOCALVIDEO_DEVICENAME, szCaptureName);
	            }
	        }

	    }


	    //拍照
	    function SnapShot(dwUserId, dwFlags, dwParam) {
	        log('SnapShot(' + dwUserId + ', ' + dwFlags + ', ' + dwParam + ')');

	        // {
	        //     userid: userid,
	        //     parentobj: parentobj,
	        //     id: id
	        // }

	        if (dwUserId == -1 || dwUserId == getway.userId) {
	            //拍摄自己
	            var res = info.setMyvideoposData;
	            if (!res) {
	                return 9;
	            }


	            var id = res.id;
	            var videoobj = document.getElementById(id);


	        } else {

	            var i = getVideoPosData(dwUserId);
	            if (i == -1) return 9;

	            var id = info.setvideoposData[i].id;
	            var videoobj = document.getElementById(id);
	            if (!videoobj) return 9;

	            function getVideoPosData(userid) {
	                var arr = info.setvideoposData;
	                for (var i in arr) {
	                    if (arr[i].userId == userid) {

	                    }
	                }
	                if (i) {
	                    return i;
	                } else {
	                    return -1;
	                }

	            }


	        }

	        var canvas = document.createElement("canvas");
	        var ctx = canvas.getContext("2d");
	        var width = videoobj.clientWidth;
	        var height = videoobj.clientHeight;

	        canvas.width = width;
	        canvas.height = height;


	        //绘制到canvas上
	        ctx.drawImage(videoobj, 0, 0, width, height);
	        document.getElementsByTagName('body')[0].appendChild(canvas);
	        canvas.style.display = 'none';

	        var imgData = canvas.toDataURL();

	        dwFlags = dwFlags | 0x00020000	///< 缓冲区数据回调

	        //回调出去
	        CallBackFuc.OnRecordSnapShot && CallBackFuc.OnRecordSnapShot(dwUserId, imgData, dwParam, dwFlags)

	        return imgData;

	    }

	    function shareScreen(id) {
	        getway.shareScreen(id);
	    }

	    /**
	     * 浏览器关闭 或 刷新
	     */
	    window.onbeforeunload = function () {
	        Logout();
	    }


	    init();
	    _export.InitSDK = InitSDK; //初始化
	    _export.Connect = Connect; //链接
	    _export.Login = Login; //登录
	    _export.LoginEx = LoginEx; //登录扩展
	    _export.EnterRoom = EnterRoom; //进入房间
	    _export.EnterRoomEx = EnterRoomEx; //进入房间扩展
	    _export.LeaveRoom = leaveroom; //离开房间
	    _export.Logout = Logout; //注销
	    _export.on = on;
	    _export.UserCameraControl = UserCameraControl; //摄像头控制
	    _export.UserCameraControlEx = UserCameraControlEx; //摄像头控制扩展
	    _export.UserSpeakControl = UserSpeakControl; //麦克风控制
	    _export.PrepareFetchDevices = PrepareFetchDevices; //枚举设备数量
	    _export.FetchNextDevice = FetchNextDevice; //枚举设备数量
	    _export.DeviceNameMapping = DeviceNameMapping; //设备名称ID映射
	    _export.SetVideoPos = SetVideoPos; // 设置视频显示位置
	    _export.SetUserStreamInfoString = SetUserStreamInfoString; //设置视频
	    _export.SetUserStreamInfoInt = SetUserStreamInfoInt; //设置视频
	    _export.SetSDKOptionString = SetSDKOptionString; //系统全局设置
	    _export.SetSDKOptionInt = SetSDKOptionInt; //系统全局设置
	    _export.VideoCallControl = VideoCallControl; //呼叫
	    _export.SetObjectStringValue = SetObjectStringValue; //设置业务对象信息
	    _export.SetObjectIntValue = SetObjectIntValue; //设置业务对象信息
	    _export.GetObjectIntValue = GetObjectIntValue; //获取业务对象参数值
	    _export.GetObjectStringValue = GetObjectStringValue; //获取业务对象参数值
	    _export.ObjectControl = ObjectControl; // 业务对象控制指令
	    _export.ObjectGetIdList = ObjectGetIdList; //获取业务对象ID列表（返回一个ObjectId的数组）
	    _export.GetRoomOnlineUsers = GetRoomOnlineUsers; //获取房间用户列表数组
	    _export.SendTextMessage = SendTextMessage; //发送文字信息
	    _export.GetSDKOptionString = GetSDKOptionString; //获取sdkOption
	    _export.GetSDKOptionInt = GetSDKOptionInt; //获取sdkOption
	    _export.TransBuffer = TransBuffer; //发送透明通道
	    _export.TransBufferEx = TransBufferEx; //发送透明通道扩展方法
	    _export.GetVersion = GetVersion; //版本信息
	    _export.GetCurrentDevice = GetCurrentDevice; //获取当前设备
	    _export.QueryUserStateInt = QueryUserStateInt; // 查询指定用户相关状态（整型值状态）
	    _export.UserSpeakControlEx = UserSpeakControlEx; //声音
	    _export.GetUserFriends = GetUserFriends; //获取好友列表
	    _export.GetUserInfo = GetUserInfo; //获取信息；
	    _export.GetFriendStatus = GetFriendStatus; //获取好友状态
	    _export.QueryInfoFromServer = QueryInfoFromServer; //获取用户
	    _export.QueryUserStateString = QueryUserStateString; //获取用户信息
	    _export.StreamRecordCtrl = StreamRecordCtrl; //录像
	    _export.StreamRecordCtrlEx = StreamRecordCtrlEx; //录像扩展方法
	    _export.SelectDevice = SelectDevice; //切换摄像头
	    _export.SnapShot = SnapShot; //拍照
	    _export.shareScreen = shareScreen; //屏幕共享

	    return _export;
	};


	//上传日志
	var upload_log_arr = [];
	function Uploadlog(msg) {
	    var data = {};
	    data.msgbuf = msg;
	    if (getway) {
	        if (getway.userid != -1) {
	            for (var i in upload_log_arr) {
	                getway && getway.socket_send('request', 0, 'uploadlog', upload_log_arr[i]);
	            }
	            upload_log_arr = [];
	            getway.socket_send('request', 0, 'uploadlog', data);
	        } else {
	            upload_log_arr.push(data);
	        }
	    } else {
	        upload_log_arr.push(data);
	    }
	}


	exports.instance = AnyChatSDK;
	exports.Uploadlog = Uploadlog;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	/**
	 * Created by fanyongsheng on 2017/7/10.
	 */

	var data_package = __webpack_require__(3);
	var config = __webpack_require__(4);
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

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	/**
	 * Created by fanyongsheng on 2017/8/2.
	 */
	var sendData = {}; //缓存数据
	var index_seq = 0; //序号
	var index_last_seq = 0; //上次的
	var way; //外部webrtc对象
	var index_notify = 0;
	var timer_ = 3000;
	//发包处理
	function data_pack(send_json) {
	    if (send_json.data.cmdcode !== 'heartbeat') {
	        send_json.seq = ++index_seq;
	        sendData[index_seq] = send_json;
	    }
	    return send_json;
	}
	//清理包
	function delet_pack(index) {
	    for (var i = index; i >= index_last_seq; i--) {
	        delete sendData[i];
	    }
	    index_last_seq = index;
	}
	//设置way
	function setWay(getway) {
	    way = getway;
	    setInterval(function () {
	        ack();
	    }, timer_);
	}
	//设置最大的notify_index
	function set_big_index_notify(index) {
	    if (index - index_notify === 1) {
	    }
	    else {
	        //重发
	        restrans(index_notify);
	    }
	    index_notify = index;
	}
	//发送ack
	function ack() {
	    var send_json = {
	        eventname: "ack",
	        ssrc: 0,
	        seq: index_notify,
	        data: {}
	    };
	    if (way.is_socket) {
	        way.socket.send(JSON.stringify(send_json));
	    }
	}
	//重发
	function restrans(index) {
	    var send_json = {
	        "eventname": "request",
	        "ssrc": 0,
	        "seq": 0,
	        "data": { cmdcode: "restrans", "begin_reg": ++index }
	    };
	    if (way.is_socket) {
	        way.socket.send(JSON.stringify(send_json));
	    }
	}
	//重发数据到服务端
	function restrans_to_service(index) {
	    for (var i in sendData) {
	        if (i > index) {
	            if (way.is_socket && sendData[i]) {
	                way.socket.send(JSON.stringify(sendData[i]));
	                delete sendData[i];
	            }
	        }
	    }
	}
	//清理数据
	function clear_all() {
	    index_seq = 0;
	    index_notify = 0;
	}
	exports.data_pack = data_pack;
	exports.delt_pack = delet_pack;
	exports.setWay = setWay;
	exports.set_big_index_notify = set_big_index_notify;
	exports.restrans_to_service = restrans_to_service;
	exports.clear_all = clear_all;


/***/ }),
/* 4 */
/***/ (function(module, exports) {

	var config = {
	    timeOutInt:30,    //网络超时时间 单位 s
	    bitrate:200,      //视频码率
	    videowidth:320,   //视频宽度
	    videoheight:240,  //视频高度
	    videofps:15,      //视频征率
	    sdk_version:'6.5' //h5sdk版本
	}
	module.exports = config;


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	/**
	 * Created by fanyongsheng on 2017/7/20.
	 */
	//心跳
	var timer_handle = 5; //心跳定时器
	var timer; //定时器句柄
	function start(getway) {
	    var data = {};
	    clearInterval(timer);
	    timer = setInterval(function () {
	        getway.socket_send('request', 0, 'heartbeat', data);
	    }, timer_handle * 1000);
	}
	function notify(errorcde) {
	    //log('心在跳');
	}
	function stop_log() {
	    timer && clearInterval(timer);
	}
	exports.start = start;
	exports.notify = notify;
	exports.stop = stop_log;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

	/**
	 * Created by fanyongsheng on 2017/7/26.
	 */
	var Object_O = /** @class */ (function () {
	    function Object_O(message) {
	        this.getway = message;
	        this.objectInfoData = {};
	        this.objectInfoData_1 = {};
	        this.objectidlist_4 = [];
	        this.objectidlist_5 = [];
	    }
	    //设置object信息
	    Object_O.prototype.setObjectInfo = function (objectInfo) {
	        var key = objectInfo.objecttype + '_' + objectInfo.objectid;
	        if (!this.objectInfoData[key]) {
	            if (objectInfo.objecttype == ANYCHAT_OBJECT_TYPE_QUEUE) {
	                this.objectidlist_5.push(objectInfo.objectid);
	            }
	            if (objectInfo.objecttype == ANYCHAT_OBJECT_TYPE_AREA) {
	                this.objectidlist_4.push(objectInfo.objectid);
	            }
	        }
	        this.objectInfoData[key] = JSON.parse(objectInfo.jsonbuf);
	    };
	    Object_O.prototype.setObjectInfo_1 = function (objectInfo) {
	        var key = objectInfo.objecttype + '_' + objectInfo.objectid;
	        this.objectInfoData_1[key] = JSON.parse(objectInfo.jsonbuf);
	    };
	    //获取对象信息
	    Object_O.prototype.GetObjectIntValue = function (dwObjectType, dwObjectId, dwInfoName) {
	        var that = this;
	        var value = 0;
	        var i = dwObjectType + '_' + dwObjectId;
	        if (!that.objectInfoData[i])
	            return 'undefined';
	        if (dwInfoName == ANYCHAT_OBJECT_INFO_FLAGS)
	            value = that.objectInfoData[i].flags;
	        else if (dwInfoName == ANYCHAT_OBJECT_INFO_PRIORITY)
	            value = that.objectInfoData[i].priority;
	        else if (dwInfoName == ANYCHAT_OBJECT_INFO_ATTRIBUTE)
	            value = that.objectInfoData[i].attribute;
	        else if (dwInfoName == ANYCHAT_OBJECT_INFO_INTTAG)
	            value = that.objectInfoData[i].inttag;
	        else if (dwInfoName == ANYCHAT_QUEUE_INFO_BEFOREUSERNUM)
	            value = that.objectInfoData_1[i].beforeusernum;
	        else if (dwInfoName == ANYCHAT_QUEUE_INFO_MYSEQUENCENO)
	            value = that.objectInfoData_1[i].mysequenceno;
	        else if (dwInfoName == ANYCHAT_QUEUE_INFO_MYENTERQUEUETIME)
	            value = that.objectInfoData_1[i].myenterqueuetime;
	        else if (dwInfoName == ANYCHAT_QUEUE_INFO_WAITTIMESECOND)
	            value = that.objectInfoData_1[i].waittimesecond;
	        else if (dwInfoName == ANYCHAT_QUEUE_INFO_LENGTH)
	            value = that.objectInfoData_1[i].queuelength;
	        //else if(dwInfoName == ANYCHAT_QUEUE_INFO_WAITTIMESECOND)
	        //value = that.queueWaitSeconds;
	        return value;
	    };
	    //获取对象信息
	    Object_O.prototype.GetObjectStringValue = function (dwObjectType, dwObjectId, dwInfoName) {
	        var that = this;
	        var value = "";
	        var i = dwObjectType + '_' + dwObjectId;
	        if (!that.objectInfoData[i])
	            return 'undefined';
	        if (dwInfoName == ANYCHAT_OBJECT_INFO_NAME)
	            value = that.objectInfoData[i].objectname;
	        else if (dwInfoName == ANYCHAT_OBJECT_INFO_DESCRIPTION)
	            value = that.objectInfoData[i].description;
	        else if (dwInfoName == ANYCHAT_OBJECT_INFO_STRINGTAG)
	            value = that.objectInfoData[i].stringtag;
	        return value;
	    };
	    Object_O.prototype.ObjectGetIdList = function (dwObjectType) {
	        if (dwObjectType == ANYCHAT_OBJECT_TYPE_QUEUE) {
	            return this.objectidlist_5;
	        }
	        if (dwObjectType == ANYCHAT_OBJECT_TYPE_AREA) {
	            return this.objectidlist_4;
	        }
	    };
	    return Object_O;
	}());
	// 对象类型定义
	var ANYCHAT_OBJECT_TYPE_AREA = 4; // 服务区域
	var ANYCHAT_OBJECT_TYPE_QUEUE = 5; // 队列对象
	var ANYCHAT_OBJECT_TYPE_AGENT = 6; // 客服对象
	var ANYCHAT_OBJECT_TYPE_CLIENTUSER = 8; // 客户端用户对象，用于与服务器交换数据
	var ANYCHAT_OBJECT_TYPE_SKILL = 9; // 业务技能对象
	var ANYCHAT_OBJECT_TYPE_QUEUEGROUP = 10; // 队列分组对象
	// 通用标识定义
	var ANYCHAT_OBJECT_FLAGS_CLIENT = 0; // 普通客户
	var ANYCHAT_OBJECT_FLAGS_AGENT = 2; // 坐席用户
	var ANYCHAT_OBJECT_FLAGS_MANANGER = 4; // 管理用户
	var ANYCHAT_OBJECT_FLAGS_AUTOMODE = 16; // 自动服务模式
	var ANYCHAT_INVALID_OBJECT_ID = -1; // 无效的对象ID
	// 坐席服务状态定义
	var ANYCHAT_AGENT_STATUS_CLOSEED = 0; // 关闭，不对外提供服务
	var ANYCHAT_AGENT_STATUS_WAITTING = 1; // 等待中，可随时接受用户服务
	var ANYCHAT_AGENT_STATUS_WORKING = 2; // 工作中，正在为用户服务
	var ANYCHAT_AGENT_STATUS_PAUSED = 3; // 暂停服务
	var ANYCHAT_AGENT_STATUS_OFFLINE = 10; // 离线
	/**
	 *	对象属性定义
	 */
	// 对象公共信息类型定义
	var ANYCHAT_OBJECT_INFO_FLAGS = 7; // 对象属性标志
	var ANYCHAT_OBJECT_INFO_NAME = 8; // 对象名称
	var ANYCHAT_OBJECT_INFO_PRIORITY = 9; // 对象优先级
	var ANYCHAT_OBJECT_INFO_ATTRIBUTE = 10; // 对象业务属性
	var ANYCHAT_OBJECT_INFO_DESCRIPTION = 11; // 对象描述
	var ANYCHAT_OBJECT_INFO_INTTAG = 12; // 对象标签，整型，上层应用自定义
	var ANYCHAT_OBJECT_INFO_STRINGTAG = 13; // 对象标签，字符串，上层应用自定义
	var ANYCHAT_OBJECT_INFO_GUID = 14; // 对象GUID
	var ANYCHAT_OBJECT_INFO_STATUSJSON = 15; // 对象状态属性集合
	// 服务区域信息类型定义
	var ANYCHAT_AREA_INFO_AGENTCOUNT = 401; // 服务区域客服用户数
	var ANYCHAT_AREA_INFO_GUESTCOUNT = 402; // 服务区域内访客的用户数（没有排入队列的用户）
	var ANYCHAT_AREA_INFO_QUEUEUSERCOUNT = 403; // 服务区域内排队的用户数
	var ANYCHAT_AREA_INFO_QUEUECOUNT = 404; // 服务区域内队列的数量
	var ANYCHAT_AREA_INFO_AGENTIDLIST = 405; // 服务区域客服ID列表
	var ANYCHAT_AREA_INFO_IDLEAGENTCOUNT = 406; // 服务区域空闲坐席数量
	var ANYCHAT_AREA_INFO_STATUSJSON = 407; // 服务区域状态信息，返回Json数据
	var ANYCHAT_AREA_INFO_WAITINGCOUNT = 408; // 服务区域内等候服务用户数（出了队列，但没有坐席服务的用户）
	// 队列状态信息类型定义
	var ANYCHAT_QUEUE_INFO_MYSEQUENCENO = 501; // 自己在该队列中的序号
	var ANYCHAT_QUEUE_INFO_BEFOREUSERNUM = 502; // 排在自己前	面的用户数
	var ANYCHAT_QUEUE_INFO_MYENTERQUEUETIME = 503; // 进入队列的时间
	var ANYCHAT_QUEUE_INFO_LENGTH = 504; // 队列长度（有多少人在排队），整型
	var ANYCHAT_QUEUE_INFO_WAITTIMESECOND = 508; // 自己在队列中的等待时间（排队时长），单位：秒
	var ANYCHAT_QUEUE_INFO_AGENTINFO = 509; // 服务当前队列的坐席信息，返回Json数据
	// 客服状态信息类型定义
	var ANYCHAT_AGENT_INFO_SERVICESTATUS = 601; // 服务状态，整型
	var ANYCHAT_AGENT_INFO_SERVICEUSERID = 602; // 当前服务的用户ID，整型
	var ANYCHAT_AGENT_INFO_SERVICEBEGINTIME = 603; // 当前服务的开始时间，整型
	var ANYCHAT_AGENT_INFO_SERVICETOTALTIME = 604; // 累计服务时间，整型，单位：秒
	var ANYCHAT_AGENT_INFO_SERVICETOTALNUM = 605; // 累计服务的用户数，整型
	var ANYCHAT_AGENT_INFO_SERVICEUSERINFO = 606; // 当前服务用户信息，字符串
	var ANYCHAT_AGENT_INFO_RELATEQUEUES = 607; // 关联队列List，字符串
	/**
	 *	对象方法定义
	 */
	// 对象公共参数控制常量定义
	var ANYCHAT_OBJECT_CTRL_CREATE = 2; // 创建一个对象
	var ANYCHAT_OBJECT_CTRL_SYNCDATA = 3; // 同步对象数据给指定用户，dwObjectId=-1，表示同步该类型的所有对象
	var ANYCHAT_OBJECT_CTRL_DEBUGOUTPUT = 4; // 对象调试信息输出
	var ANYCHAT_OBJECT_CTRL_DELETE = 5; // 删除对象
	var ANYCHAT_OBJECT_CTRL_MODIFY = 6; // 修改对象信息
	// 服务区域控制常量定义
	var ANYCHAT_AREA_CTRL_USERENTER = 401; // 进入服务区域
	var ANYCHAT_AREA_CTRL_USERLEAVE = 402; // 离开服务区域
	// 队列参数控制常量定义
	var ANYCHAT_QUEUE_CTRL_USERENTER = 501; // 进入队列
	var ANYCHAT_QUEUE_CTRL_USERLEAVE = 502; // 离开队列
	// 客服参数控制常量定义
	var ANYCHAT_AGENT_CTRL_SERVICESTATUS = 601; // 坐席服务状态控制（暂停服务、工作中、关闭）
	var ANYCHAT_AGENT_CTRL_SERVICEREQUEST = 602; // 服务请求
	var ANYCHAT_AGENT_CTRL_FINISHSERVICE = 604; // 结束服务
	var ANYCHAT_AGENT_CTRL_EVALUATION = 605; // 服务评价，wParam为客服userid，lParam为评分，lpStrValue为留言
	/**
	 *	对象异步事件定义
	 */
	// 对象公共事件常量定义
	var ANYCHAT_OBJECT_EVENT_UPDATE = 1; // 对象数据更新
	var ANYCHAT_OBJECT_EVENT_SYNCDATAFINISH = 2; // 对象数据同步结束
	// 服务区域事件常量定义
	var ANYCHAT_AREA_EVENT_STATUSCHANGE = 401; // 服务区域状态变化
	var ANYCHAT_AREA_EVENT_ENTERRESULT = 402; // 进入服务区域结果
	var ANYCHAT_AREA_EVENT_USERENTER = 403; // 用户进入服务区域
	var ANYCHAT_AREA_EVENT_USERLEAVE = 404; // 用户离开服务区域
	var ANYCHAT_AREA_EVENT_LEAVERESULT = 405; // 离开服务区域结果
	// 队列事件常量定义
	var ANYCHAT_QUEUE_EVENT_STATUSCHANGE = 501; // 队列状态变化
	var ANYCHAT_QUEUE_EVENT_ENTERRESULT = 502; // 进入队列结果
	var ANYCHAT_QUEUE_EVENT_USERENTER = 503; // 用户进入队列
	var ANYCHAT_QUEUE_EVENT_USERLEAVE = 504; // 用户离开队列
	var ANYCHAT_QUEUE_EVENT_LEAVERESULT = 505; // 离开队列结果
	// 坐席事件常量定义
	var ANYCHAT_AGENT_EVENT_STATUSCHANGE = 601; // 坐席状态变化
	var ANYCHAT_AGENT_EVENT_SERVICENOTIFY = 602; // 坐席服务通知（哪个用户到哪个客服办理业务）
	var ANYCHAT_AGENT_EVENT_WAITINGUSER = 603; // 暂时没有客户，请等待
	var ANYCHAT_AGENT_EVENT_ISREADY = 604; // 坐席准备好，可以发起呼叫
	module.exports = Object_O;


/***/ }),
/* 7 */
/***/ (function(module, exports) {

	/**
	 * Created by fanyongsheng on 2017/7/12.
	 */
	var timer; //定时器
	var private_fuc = function (getway) {
	    var fuc = {};
	    fuc.createStream = function (obj, deviceObj) {
	        var id;
	        if (obj) {
	            id = obj.id || obj.deviceId;
	            getway.createStream(id, deviceObj);
	        } else {
	            getway.createStream('', deviceObj);
	        }

	    };


	    /**
	     * 清理定时器重连成功
	     */
	    fuc.clear_timer = function () {
	        getway.timeOut = 0;
	        if (!timer) {
	            clearInterval(timer);
	            timer = null;
	        }
	    };

	    /**
	     * 重连方法
	     */
	    fuc.tokenconnect = function (addr, videoStream) {
	        if (!timer) {
	            timer = setInterval(function () {
	                if (getway.is_socket) {
	                    clearInterval(timer);
	                    timer = null;
	                    return false;
	                }
	                getway.timeOut++;
	                // log('正在重连：' + getway.timeOut);
	                if (getway.timeOut == getway.timeOutInt) {
	                    if (!getway.is_socket) {
	                        clearInterval(timer);
	                        BRAC_LeaveRoom();
	                        getway.emit('linkclose', 100);
	                        getway.sendData = {};
	                        getway.roomid = '';
	                        getway.sessionid = '';
	                        getway.timeOut = 0;
	                        timer = null;
	                    }
	                }

	            }, 1000);
	        }
	        setTimeout(function () {
	            getway.socket = null;
	            getway.connect(addr);
	        }, 4000);
	        //if(getway.timeOut<getway.timeOutInt){
	        //
	        //}
	    };


	    //设置流
	    fuc.strema_video = function (info, dwStreamIndex, infoname, value) {
	        var obj = {},
	            streamindex_video = info.streamindex_video,
	            k;
	        switch (infoname) {
	            case BRAC_SO_LOCALVIDEO_DEVICENAME:
	            case BRAC_STREAMINFO_VIDEOCODECID:
	                //设置流号
	                obj.dwStreamIndex = dwStreamIndex;
	                obj.cameraName = value;
	                streamindex_video[dwStreamIndex] = obj;
	                break;
	            case BRAC_SO_LOCALVIDEO_WIDTHCTRL:
	                //分辨率宽度
	                if (k == -1) {

	                } else {
	                    streamindex_video[dwStreamIndex].width = value;
	                }
	                break;
	            case BRAC_SO_LOCALVIDEO_HEIGHTCTRL:
	                //分辨率高度
	                if (k == -1) {

	                } else {
	                    streamindex_video[dwStreamIndex].height = value;
	                }
	                break;
	            case BRAC_SO_LOCALVIDEO_FPSCTRL:
	                //帧率
	                if (k == -1) {

	                } else {
	                    streamindex_video[dwStreamIndex].fpsctrl = value;
	                }
	                break;
	            case BRAC_SO_LOCALVIDEO_BITRATECTRL:
	                //码率
	                getway.bitrate = value / 1000;
	                if (k == -1) {

	                } else {
	                    streamindex_video[dwStreamIndex].fpscode = value;
	                }
	                break;
	        }

	        return streamindex_video;
	    };


	    /**
	     * getsdk
	     */
	    fuc.GetSDKOptionString = function(optname){
	        var val = '';
	        optname = optname - 0;

	        switch(optname){
	            //获取sdk编译时间
	            case 24:
	                val = window.AnyChatSDKVersion;
	                val = val.split(' : ')[1];
	                break;
	        }

	        return val;
	    }

	    // 获取当前浏览器
	    fuc.getBrowser = function () {
	        var browser = "unknown browser";
	        var ua = navigator.userAgent.toLowerCase();

	        var info = {
	            ie: /msie/.test(ua) && !/opera/.test(ua),
	            op: !/msie/.test(ua) && /opera/.test(ua),
	            sa: /version.*safari/.test(ua),
	            ch: /chrome/.test(ua) && window.navigator.webkitPersistentStorage,
	            ff: /firefox/.test(ua),
	            qh360: /chrome/.test(ua) && !window.navigator.webkitPersistentStorage,
	            qq: /qqbrowser/.test(ua),
	            sg: /metasr/.test(ua)
	        };

	        if (info.ch) {
	            browser = "Chrome";
	        } else if (info.ie) {
	            browser = "IE";
	        } else if (info.ff) {
	            browser = "Firefox";
	        } else if (info.sa) {
	            browser = "Safari";
	        } else if (info.qh360) {
	            browser = "360浏览器";
	        } else if (info.op) {
	            browser = "Opera";
	        } else if (info.qq) {
	            browser = "QQ浏览器";
	        } else if (info.sg) {
	            browser = "搜狗浏览器";
	        }

	        return browser;
	    };


	    /**
	     * 判断手机系统
	     * @returns {*}
	     */
	    fuc.system_s = function (type) {
	        if (navigator) {
	            var userAgentInfo = navigator.userAgent;

	        } else {
	            if (type === 1) return 3;
	            return 'ios';
	        }
	        if (userAgentInfo.indexOf('Chrome/60.0.3112.116') > 0) {
	            //特殊浏览器版本，宽高比和高宽比反了
	            getway.mobile_type = 1;
	        }



	        var android = new Array("Android");
	        var ios = new Array("iPhone", "iPad", "iPod", "Safari");
	        var windows = new Array("Windows",'Linux');
	        for (var v = 0; v < android.length; v++) {
	            var k = userAgentInfo.indexOf(android[v]);
	            if (k > 0) {
	                if (type === 1) return 2;
	                return 'android';
	            }
	        }
	        for (var v = 0; v < windows.length; v++) {
	            var k = userAgentInfo.indexOf(windows[v]);
	            if (k > 0) {
	                if (type === 1) return 1;
	                return 'windows';
	            }
	        }
	        for (var v = 0; v < ios.length; v++) {
	            var k = userAgentInfo.indexOf(ios[v]);
	            if (k > 0) {
	                if (type === 1) {
	                    if (userAgentInfo.indexOf("iPhone") > 0) {
	                        log('iphone');
	                        return 4;
	                    }
	                    return 3;
	                } else {

	                }
	                return 'ios';
	            }
	        }

	    };


	    fuc.log = function (message) {

	        console.log(message);
	    };

	    /*
	     关闭所有
	     */
	    fuc.closeAll = function (videoStream) {
	        try {
	            for (var i in videoStream) {
	                if (videoStream[i]) {
	                    log('Turn off camera');
	                    log(videoStream[i].getVideoTracks()[0]);
	                    videoStream[i].getVideoTracks()[0].stop();
	                    // videoStream[i].getAudioTracks()[0].stop();
	                    videoStream[i] = '';
	                    getway.localMediaStream = null;
	                }
	            }
	        } catch (e) {
	            log(e);
	        }


	        getway.closeAllPeerConnection();
	        getway.removeVideo();


	    };

	    /*
	     关闭自己
	     */
	    fuc.closeMyCamera = function (videoStream) {
	        try {
	            log('Turn off camera');

	            videoStream[0].getVideoTracks()[0].stop();
	            // videoStream[0].getAudioTracks()[0].stop();
	            videoStream[0] = '';
	            getway.removeMyVideo();
	            getway.localMediaStream = null;
	        } catch (e) {

	            log(e);
	        }
	    };

	    fuc.closeOtherCamera = function (pid) {
	        getway.closeOtherPeerConnection(pid);
	        getway.removeOtherVideo(pid);
	    };


	    //链接成功后发送setsdkoption
	    fuc.SetSDKOptionString = function (SetSDKOptionStringArr) {
	        for (var i in SetSDKOptionStringArr) {
	            var data = {};
	            data = SetSDKOptionStringArr[i];
	            getway.socket_send('request', 0, 'setsdkoptionstring', data);
	        }
	    };

	    //链接成功后发送setsdkoption
	    fuc.SetSDKOptionInt = function (SetSDKOptionIntArr) {
	        for (var i in SetSDKOptionIntArr) {
	            var data = {};
	            data = SetSDKOptionIntArr[i];
	            getway.socket_send('request', 0, 'setsdkoptionint', data);
	        }

	    };

	    //移除元素
	    fuc.ArrayremoveByValue = function (arr, val) {
	        for (var i = 0; i < arr.length; i++) {
	            if (arr[i] == val) {
	                arr.splice(i, 1);
	                break;
	            }
	        }
	    };



	    /**
	     * 调节视频最大码率
	     * @param sdp
	     * @param viderate
	     * @param audiorate
	     * @returns {*}
	     */
	    fuc.setMediaBitrates = function (sdp, viderate, audiorate) {
	        // return updateBandwidthRestriction(sdp,viderate);
	        return setMediaBitrate(setMediaBitrate(sdp, "video", viderate), "audio", audiorate);
	    };

	    function updateBandwidthRestriction(sdp, bandwidth) {
	        var modifier = 'AS';
	        // if (adapter.browserDetails.browser === 'firefox') {
	        //   bandwidth = (bandwidth >>> 0) * 1000;
	        //   modifier = 'TIAS';
	        // }
	        if (sdp.indexOf('b=' + modifier + ':') === -1) {
	            // insert b= after c= line.
	            sdp = sdp.replace(/c=IN (.*)\r\n/,
	                'c=IN $1\r\nb=' + modifier + ':' + bandwidth + '\r\n');
	        } else {
	            sdp = sdp.replace(new RegExp('b=' + modifier + ':.*\r\n'),
	                'b=' + modifier + ':' + bandwidth + '\r\n');
	        }
	        return sdp;
	    }


	    function setMediaBitrate(sdp, media, bitrate) {

	        var lines = sdp.split("\r\n");
	        var line = -1;
	        for (var i = 0; i < lines.length; i++) {
	            console.log("m=" + media);
	            if (lines[i].indexOf("m=" + media) === 0) {

	                line = i;
	                break;
	            }
	        }
	        if (line === -1) {
	            console.debug("Could not find the m line for", media);

	            return sdp;
	        }

	        console.debug("Found the m line for", media, "at line", line);

	        line++;

	        while (lines[line].indexOf("i=") === 0 || lines[line].indexOf("c=") === 0) {

	            line++;
	        }

	        if (lines[line].indexOf("b") === 0) {

	            console.debug("Replaced b line at line", line);

	            lines[line] - "b=AS." + bitrate;

	            return lines.join("\r\n");
	        }

	        console.debug("Adding new b line before line", line);

	        var newLines = lines.slice(0, line);

	        newLines.push("b=AS:" + bitrate);

	        newLines = newLines.concat(lines.slice(line, lines.length));

	        return newLines.join("\r\n")
	    }


	    /**
	     * 文件下载
	     * @param content
	     * @param filename
	     */
	    fuc.funDownload = function (content, filename) {
	        // 创建隐藏的可下载链接
	        var eleLink = document.createElement('a');
	        eleLink.download = filename;
	        eleLink.style.display = 'none';
	        // 字符内容转变成blob地址
	        var blob = new Blob([content]);
	        eleLink.href = URL.createObjectURL(blob);
	        // 触发点击
	        document.body.appendChild(eleLink);
	        eleLink.click();
	        // 然后移除
	        document.body.removeChild(eleLink);
	    };



	    /**
	     * 获取中文长度 一个中文 三个字节长度
	     * 
	     */
	    fuc.getStringLength = function (string) {
	        var str = string;
	        var bytesCount;
	        for (var i = 0; i < str.length; i++) {
	            var c = str.charAt(i);
	            if (/^[\u0000-\u00ff]$/.test(c)) //匹配双字节
	            {
	                bytesCount += 1;
	            } else {
	                bytesCount += 3;
	            }
	        }
	        return bytesCount;
	    }


	    //拆分功能标识值，返回对象集合
	    fuc.exportNumList = function (number) {
	        var retVal = {};
	        var bFactor = 1;

	        if (number == 1) {
	            retVal[number] = number;
	            return retVal;
	        }

	        while (number >= bFactor) {
	            var iNumber = number & bFactor;

	            if (iNumber) {
	                retVal[iNumber] = iNumber;
	            }

	            bFactor = bFactor << 1;
	        }

	        return retVal;
	    }

	    return fuc;
	};


	exports.instance = private_fuc;

/***/ }),
/* 8 */
/***/ (function(module, exports) {

	var Log = /** @class */ (function () {
	    function Log() {
	        this.filename = 'BRAnyChatCore.txt';
	        this.log_txt = '日志内容';
	    }
	    Log.prototype.explore = function (content, filename, is) {
	        // 创建隐藏的可下载链接
	        if (is) {
	            return this.weixinLog(content);
	        }
	        else {
	            //alert(URL.createObjectURL(blob));
	            // 触发点击
	            var eleLink = document.createElement('a');
	            eleLink.download = filename;
	            //var text = document.createTextNode('下载');
	            //eleLink.appendChild(text);
	            eleLink.style.display = 'none';
	            var blob;
	            try {
	                blob = new Blob([content], { type: 'text/plain' });
	            }
	            catch (e) {
	                var blob_old = BlobBuilder || WebKitBlobBuilder || MozBlobBuilder || '';
	                if (e.name == 'TypeError' && blob_old) {
	                    var bb = new blob_old();
	                    bb.append([content]);
	                    blob = bb.getBlob("text/plain");
	                }
	            }
	            // 字符内容转变成blob地址
	            eleLink.href = URL.createObjectURL(blob);
	            document.body.appendChild(eleLink);
	            eleLink.click();
	            // 然后移除
	            document.body.removeChild(eleLink);
	        }
	    };
	    Log.prototype.weixinLog = function (content) {
	        var c = document.getElementById("myCanvas");
	        c.style.width = '640px';
	        canvasTextAutoLine(content, c, 20, 20, 22);
	        function convertCanvasToImage(canvas) {
	            var image = new Image();
	            //image.src = canvas.toDataURL("image/png");
	            return canvas.toDataURL("image/jpeg");
	        }
	        function canvasTextAutoLine(str, canvas, initX, initY, lineHeight) {
	            var ctx = canvas.getContext("2d");
	            ctx.fillStyle = '#ffffff';
	            ctx.font = '20px';
	            var lineWidth = 0;
	            var canvasWidth = canvas.width;
	            var lastSubStrIndex = 0;
	            for (var i = 0; i < str.length; i++) {
	                lineWidth += ctx.measureText(str[i]).width;
	                if (lineWidth > canvasWidth - initX || str[i] == '&') {
	                    if (str[i] == '&') {
	                        //ctx.fillText('',initX,initY);
	                    }
	                    else {
	                    }
	                    ctx.fillText(str.substring(lastSubStrIndex, i), initX, initY);
	                    initY += lineHeight;
	                    lineWidth = 0;
	                    lastSubStrIndex = i;
	                }
	                if (i == str.length - 1) {
	                    ctx.fillText(str.substring(lastSubStrIndex, i + 1), initX, initY);
	                }
	            }
	        }
	        return convertCanvasToImage(c);
	    };
	    Log.prototype.doExplore = function (is) {
	        return this.explore(this.log_txt, this.filename, is);
	    };
	    Log.prototype.putLog = function (content) {
	        this.log_txt = content;
	    };
	    return Log;
	}());
	var obj_log = new Log();
	module.exports = obj_log;


/***/ })
/******/ ]);