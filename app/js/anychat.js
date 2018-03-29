/**
 * Created by fanyongsheng on 2017/7/10.
 */
/**********************************************************/
/*                                                        */
/*                       anychatsdk obj                    */
/*                                                        */
/**********************************************************/

var webrtc = require('./webrtc.js');
var heartbeat_module = require('./heartbeat.ts');
var object_o = require('./objectcontrol.ts');
var private_fuc_module = require('./private_fuc.js');
var data_package = require('./data_package.ts');
var config = require('./config.js');
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