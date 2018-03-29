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