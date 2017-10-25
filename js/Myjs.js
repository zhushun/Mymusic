/**
 * Created by Administrator on 2017/10/18.
 */
/*
 $userinput：用户输入框
 $serachBtn：用户搜索按钮
 $showImg：显示的图片
 $songname：歌曲名字
 $singer：singer
 $musicList：歌曲列表
 $lyric：歌词
 $mainTitle：title 名字
 $musicScrollBar：歌曲滚动条
 $lyricScrollBar：歌词滚动条
 $audio：音频标签
 $startTime：开始时间
 $endTime：总时间/结束时间
 $prev：上一曲
 $play/播放
 $next：下一曲
 $durationBar：播放进度条
 $volumeBar：音量条
 $volume：音量图标
 $search：搜索按钮
 $userinput：输入框
 */
(function () {
    var $userinput = $('.text'),//输入框
        $serachBtn = $('.search'),//搜索（图标）
        $classList=$('.classList'),//歌曲分类列表
        $showImg = $('#showImg'),//歌曲图片
        $songname = $('#songname'),//歌名
        $singer = $('#singer'),//歌手名
        $musicList = $('.musicList'),//歌曲列表
        $lyric = $('#lyric'),//歌词
        $Lul=$lyric.find("ul"),//歌词存储区
        $mainTitle = $('.title').eq(0),//归属类
        // $musicScrollBar = $('.music .scrollBar .dot').eq(0),
        // $lyricScrollBar = $('.lyric .scrollBar .dot').eq(0),
        $audio = $('#audio'),//音频标签
        $startTime = $('#startTime'),//开始时间、已经播放时间
        $endTime = $('#endTime'),//结束时间、歌曲总时间
        $prev = $('#prev'),//上一曲
        $play = $('#play'),//暂停、播放
        $next = $('#next'),//下一曲
        $durationBar = $('.b-ing').eq(0),//播放进度条
        $allWidth=$(".bar"),//播放进度条的总长度
        $Tdot=$('.t-dot'),//播放的拖拽点
        $volumeBar = $('.v-ing').eq(0),//音量条
        $Vdot=$('.v-dot'),//音量的拖拽点
        $volume = $('#volume');//音量图标
    // $search = $('#search'),
    // $userinput = $('#userinput')

    var Topid=5,
        URL="",//歌曲的播放地址
        Timer=null,//定时器0
        Timer1=null,//定时器1
        allPlayTime,//歌曲总时间
        allWidth=$allWidth.width()-12,
        changW=0,//通过滑动改变的宽度
        numb,//li元素的序列号
        musicid=204363498;

    $audio[0].volume=0.5;//设置初始音量的大小
    //获取歌曲地址
    function getURL(songlist){
        URL=songlist[numb].url;
        $audio.attr({
            "src":URL
        });
    }
//歌曲侧边分类列表的控制
    ClassList();
    function ClassList() {
        $classList.off("click").on("click","li",function(event){
            var target = $(event.target);
            target.addClass("on").siblings().removeClass("on");
            Topid=target.attr("numb");
            getData(Topid);
        })
    }
//创建songlist函数
    function createsonglist(songlist) {
        $musicList.html(" ");
        songlist.forEach(function (value , index) {
            var li=document.createElement("li");
            li.innerHTML=value.songname;
            li.setAttribute("songid",value.songid);
            $musicList.append(li);
        });
        songList(songlist);
    }
//点击哪个歌曲就给哪个歌曲添加class和播放该该歌曲
    function songList(songlist) {
        $musicList.off("click").on("click","li",function () {
            var target = $(event.target);
            numb=target.index();
            autoPlay(songlist,numb);
        });
    }
    //上一曲功能函数
    function prevFun(songlist){
        var delay=0;
        $prev.off("click").click(function(){
            console.log("上一曲");
            numb--;
            var newD=new Date();
            if(newD-delay>500){
                autoPlay(songlist,numb);
                delay=newD;
            }
        })
    }
    //下一曲功能函数
    function nextFun(songlist){
        var delay=0;
        $next.off("click").click(function(){
            numb++;
            var newD=new Date();
            if(newD-delay>500){
                autoPlay(songlist,numb);
                delay=newD;
            }
        })
    }
    //自动播放
    function autoPlay(songlist,numb){
        clearInterval(Timer);
        var $songli=$musicList.find("li");
        $songli.eq(numb).addClass("on").siblings().removeClass("on");
        $showImg.attr({
            "src":songlist[numb].albumpic_big,
            "transform": "rotateZ(0deg)"
    });
        $songname.html(songlist[numb].songname);
        $singer.html(songlist[numb].singername);
        musicid=$songli.eq(numb).attr("songid");//获取歌曲的ID
        $play.removeClass("icon-zanting1").addClass("icon-zanting");
        $audio.attr({
            "autoplay":"autoplay", //添加自动播放（目的是在左右切换歌曲是的时候，点击播放按钮可以播放）
            "duration":songlist[numb].seconds
        });//添加自动播放

        TimerLoop(songlist);//循环获取usedTime
        getlyric(musicid);
        getAlltime();
        getURL(songlist);
        $audio[0].play();//播放

    }
    //暂停与播放
    function playFun(){
        $play.off("click").click(function () {

            var b=false;
            var $yes=$musicList.find("li");
            for(var i=0;i<$yes.length;i++){
                if($yes.eq(i).hasClass("on")){
                    b=true;
                    break;
                }
            }
            if(b){
                if($audio[0].paused){
                    $(this).removeClass("icon-zanting1").addClass("icon-zanting");
                    $audio[0].play();//播放
                }else{
                    $(this).removeClass("icon-zanting").addClass("icon-zanting1");
                    $audio[0].pause();//暂停
                }
            }

            // if($audio[0].paused){
            //     $(this).removeClass("icon-zanting1").addClass("icon-zanting");
            //     $audio[0].play();//播放
            // }else{
            //     $(this).removeClass("icon-zanting").addClass("icon-zanting1");
            //     $audio[0].pause();//暂停
            // }
        })
    }
    //设置静音与非静音函数
    isvol();
    function isvol(){
        $Vdot.mousedown(function (e) {
                e=e||event.window;
                var vBwidth=$volumeBar.width();
                var sX=e.pageX;
                document.onmousemove=function (e) {
                    e=e||event.window;
                    var nX=e.pageX;
                    var wX=nX-sX;
                    if(wX+vBwidth<=0){
                        $volumeBar.width("0px");
                    }else if( wX+vBwidth>=138){
                        $volumeBar.width("138px");
                    }else{
                        $volumeBar.width(wX+vBwidth+"px");
                    }
                    var NvBwidth=$volumeBar.width();
                    var cvol = NvBwidth/138;
                    $audio[0].volume=cvol;
                };
                document.onmouseup=function () {
                    document.onmousemove=null;
                    document.onmouseup=null;
                }
        });
        $volume.click(function(){
            if($(this).hasClass("icon-yinliang")){
                $(this).addClass('icon-jingyin').removeClass("icon-yinliang");
                $audio[0].volume="0";
            }else{
                $(this).addClass('icon-yinliang').removeClass("icon-jingyin");
                $audio[0].volume="1";
            }

        });
    }
    //获取歌曲的总时间及设置
    function getAlltime(){
        var allTime=$audio.attr("duration");
        if(allTime){
            allPlayTime=allTime;
            rotateImg(allPlayTime);//歌曲图片旋转函数调用
            var m ,s;
            m=parseInt(allTime/60);
            s=parseInt(allTime%60);
            m=m>=10?m:"0"+m;
            s=s>=10?s:"0"+s;
            $endTime.html(m+":"+s);
        }

    }
    //获取已经播放的时间并设置
    function getUsedTime(useTime) {
        var m ,s;
        m=parseInt(useTime/60);
        s=Math.floor(useTime%60);
        m=m>=10?m:"0"+m;
        s=s>=10?s:"0"+s;
        $startTime.html(m+":"+s);
        playBar(useTime,allPlayTime,allWidth);

    }
    //循环调用getUseTime函数的函数
    function TimerLoop(songlist) {
        clearInterval(Timer);
        Timer=setInterval(function () {
            var a=$audio[0].currentTime;
            if(a>=allPlayTime){
                $audio[0].currentTime=0;
                a=$audio[0].currentTime;
                getUsedTime(a);
                numb++;
                autoPlay(songlist,numb);
            }else {
                getUsedTime(a);
            }
        },1000);
    }
    //播放进度条函数
    function playBar(currenTime,allPlayTime,allWidth){
        var currentWidth;
        currentWidth=currenTime*allWidth/allPlayTime;
        $durationBar.width(currentWidth+'px');

    }
    //播放进度点的拖动函数
    function drag(songlist){
        $Tdot.mousedown(function(e){
            var dBwidth=$durationBar.width();
            e=e||event.window;
            var sX=e.pageX;
            document.onmousemove=function (e) {
                // clearInterval(Timer);
                e=e||event.window;
                var nX=e.pageX;
                var wX=nX-sX;
                if(wX+dBwidth<=0){
                    $durationBar.width('0px');
                }else if(wX+dBwidth>=400){
                    $durationBar.width('388px');
                }else {
                    $durationBar.width((wX+dBwidth)+'px');
                }
                changW=wX;
                var a=(wX+dBwidth)*allPlayTime/allWidth;
                getUsedTime(a);
            };
            document.onmouseup=function () {
                document.onmousemove=null;
                if(changW !=0){
                    var dBwidth=$durationBar.width();
                    var a=(dBwidth)*allPlayTime/allWidth;
                    $audio[0].currentTime=a;
                    changW=0;
                    TimerLoop(songlist);
                }else {
                    TimerLoop(songlist);
                }
                document.onmouseup=null;
            };
        });
    }
    //歌曲图片旋转函数
    function rotateImg(allPlayTime){
        $showImg.css({
            animation:" rotate "+allPlayTime+"s linear infinite"
        })
    }
    //歌词滚动
    function runUL(){
        clearInterval(Timer1);
        var AllwidthLI=0;
        var i=0;
        var $li=$Lul.find('li');
        Timer1=setInterval(function () {
            var CM=$li.eq(i).attr("TM");
            var Tm,TT;
            Tm = CM.split(":");
           TT=Tm[0]*60+parseFloat(Tm[1]);
            if(TT < $audio[0].currentTime){
                var LIwidth=$li.eq(i).height();
                $Lul.css("top",-1*AllwidthLI+250);
                $li.eq(i).addClass("oncolor").siblings().removeClass("oncolor");
                $li.eq(i).addClass("sc").siblings().removeClass("sc");
                i++;
                AllwidthLI+=LIwidth;
            }
        },60/1000);
    }
//获取数据
    getData(Topid);
    function getData(Topid){
        $.ajax({
            url:"https://route.showapi.com/213-4?showapi_appid=48015&topid="+Topid+"&showapi_sign=9df5cdc1944d4676a3a2180cf4bb72da",
            type:"GET"
        })
        .done(function(date){
            date=date.showapi_res_body.pagebean;
            var songlist=date.songlist;

            createsonglist(songlist);
            //上一曲
            prevFun(songlist);
            //下一曲
            nextFun(songlist);
            //暂停与播放
            playFun();
            //获取歌曲的总时间
            getAlltime(songlist);
            //播放点的拖拽
            drag(songlist);
        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            console.log("complete");
        });
    }
    //查询歌词
    // getlyric(musicid);
    function getlyric(musicid) {
        $Lul.html("");
        $.ajax({
            url:'https://route.showapi.com/213-2?musicid='+musicid+'&showapi_appid=48251&showapi_sign=14a7f145729d4ad8aa596659c83e9d75',
            type:"GET"
        })
        .done(function(date){
            var data;
            var arr,nArr=[];
            data=date.showapi_res_body.lyric;
            $Lul.html(data);
            data=$Lul.html();
            $Lul.html("");

            //歌词赋值
            arr=data.split("[");
            arr.forEach(function (value,index) {
                var li=document.createElement("li");
                var curn=value.split("]");
                if(curn[1]!=0 && curn.length==2){
                    li.innerHTML=value.split("]")[1];
                    li.setAttribute("TM",value.split("]")[0]);
                    $Lul.append(li);
                }
            });
            //歌词滚动
            runUL();
        })
        .fail(function() {
            console.log("error");
        })
        .always(function() {
            console.log("complete");
        });
    }

})();