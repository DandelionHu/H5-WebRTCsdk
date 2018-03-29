/**
 * Created by fanyongsheng on 2017/8/8.
 */
declare var module;
declare var BlobBuilder;
declare var WebKitBlobBuilder;
declare var MozBlobBuilder;
declare var $;

class Log {
    filename:string; //文件名
    log_txt:string;
    constructor() {
        this.filename = 'BRAnyChatCore.txt';
        this.log_txt = '日志内容';
    }
    private explore(content:string, filename:string,is:boolean) {
        // 创建隐藏的可下载链接



        if(is){
             return this.weixinLog(content)
        }else{
            //alert(URL.createObjectURL(blob));
            // 触发点击
            var eleLink = document.createElement('a');
            eleLink.download = filename;
            //var text = document.createTextNode('下载');
            //eleLink.appendChild(text);
            eleLink.style.display = 'none';
            var blob;
            try{
                blob = new Blob([content],{type:'text/plain'});

            }catch (e){
                var blob_old  = BlobBuilder || WebKitBlobBuilder || MozBlobBuilder || '';
                if(e.name == 'TypeError' && blob_old){
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

    }
    private weixinLog(content){
        var c=document.getElementById("myCanvas");
        c.style.width = '640px';

        canvasTextAutoLine(content,c,20,20,22);




        function convertCanvasToImage(canvas) {
            var image = new Image();
            //image.src = canvas.toDataURL("image/png");
            return canvas.toDataURL("image/jpeg");
        }

        function canvasTextAutoLine(str,canvas,initX,initY,lineHeight){
            var ctx = canvas.getContext("2d");
            ctx.fillStyle = '#ffffff';
            ctx.font = '20px';
            var lineWidth = 0;
            var canvasWidth = canvas.width;
            var lastSubStrIndex= 0;
            for(let i=0;i<str.length;i++){
                lineWidth+=ctx.measureText(str[i]).width;
                if(lineWidth>canvasWidth-initX || str[i] == '&'){//减去initX,防止边界出现的问题
                    if(str[i]=='&'){
                        //ctx.fillText('',initX,initY);
                    }else{

                    }
                    ctx.fillText(str.substring(lastSubStrIndex,i),initX,initY);
                    initY+=lineHeight;
                    lineWidth=0;
                    lastSubStrIndex=i;
                }
                if(i==str.length-1){
                    ctx.fillText(str.substring(lastSubStrIndex,i+1),initX,initY);
                }
            }
        }
        return convertCanvasToImage(c);
    }
    public doExplore(is:boolean){
        return this.explore(this.log_txt,this.filename,is);

    }

    public putLog(content:string){
        this.log_txt = content;
    }

}
let obj_log = new Log();
module.exports = obj_log;