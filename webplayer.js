let videoCont = document.querySelector("#videoPlayerCont");
let video = document.querySelector("#videoPlayer");
let playBut = document.querySelector("#playpause");
let vol = document.querySelector("#volume");
let volIndic = document.querySelector("#vol-Indicator");
let volBut = document.querySelector("#volume #vol-but");
let volBar = document.querySelector("#volume #vol-percent-bar");
let volPin = document.querySelector("#volume #vol-percent-bar #vol-pin");
let currentTimeSpan = document.querySelector("#currentTime");
let totalTime = document.querySelector("#totalTime");
let subs = document.querySelector("#subs");
let settings = document.querySelector("#settings");
let pip = document.querySelector("#pip");
let fsBut = document.querySelector("#fullscreen");
let progress = document.querySelector("#progress");
let progBar = document.querySelector("#prog-bar");
let progBarLabel = document.querySelector("#prog-bar-label");

// Double-click => fullscreen Variables
let singleClick=false;
let dbClickTimer;
let dbDelay= 200;

// Sound Variables
let barWidth = Math.round( volBar.clientWidth ) || 100;
let halfBarWidth = Math.round( barWidth / 2 );
let barOffsetLeft = volBar.getBoundingClientRect().left;
let gain = 1;
let maxGain = 31.6; // plus 1 for the normal volume
let volumeStep = halfBarWidth/40;
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let AudioGainNode = AudioGain( video );
let showIndicator = true;
let indicatorTimeout;

// Timeline Variables
let BarTimer;
let currentTime = 0;
let hoveredTime;

// Initialization
video.addEventListener('loadedmetadata', (event) => {
    totalTime.innerHTML = VidDurationFormat( video.duration, "round" );
});
video.addEventListener('timeupdate', (event) => {
    let time = Math.round(video.currentTime);
    if( time === currentTime ) return;
    currentTimeSpan.innerHTML =  VidDurationFormat( currentTime = time );
});
video.addEventListener('canplaythrough', (event) => {
    console.log('I think I can play through the entire ' +
    'video without ever having to stop to buffer.');
});
video.src="vindeo.mp4";
SetVolumeSettings( {clientX : barOffsetLeft + halfBarWidth } );

// Timeline
progress.addEventListener('mousemove', e => {
    let x = e.clientX - progress.getBoundingClientRect().left;
    if( x >= 0){ 
        progress.style.setProperty("--hoverOffset",x+"px"); 
        hoveredTime = (x / progBar.clientWidth) * video.duration;
        progBarLabel.innerHTML = VidDurationFormat( hoveredTime ); 
    }
});
progress.addEventListener('click', e => {
    video.currentTime = hoveredTime; 
    if( playBut.getAttribute("data-state") === "replay" ) playBut.setAttribute("data-state","play");
    MoveProgBar();
});
progress.addEventListener('mouseleave', e => {
    progress.style.setProperty("--hoverOffset","0px");
});
function MoveProgBar(){
    let offset = (video.currentTime * 100 ) / video.duration;
    progress.style.setProperty("--barOffset", offset + "%");
}
function VidDurationFormat( sec , roundType = "floor" ) {
    let min = Math.floor(sec / 60);
    min = ( min >= 10 || min === 0 ) ? min : "0" + min;
    sec = (roundType === "floor") ? Math.floor(sec % 60) : Math.round(sec % 60);
    sec = ( sec >= 10 ) ? sec : "0" + sec;
    return min + ":" + sec;
}

// Play - Pause - Replay
playBut.addEventListener("click",PlayHandler);
video.addEventListener("click",PlayHandler);
video.addEventListener('ended', (event) => {
    playBut.setAttribute("data-state","replay");
    setTimeout(()=> clearTimeout(BarTimer) ,50);
});
function PlayHandler(e){
    singleClick = !singleClick;
    if(singleClick) {
        dbClickTimer = setTimeout(()=>{
            if(playBut.getAttribute("data-state") === "play"){
                playBut.setAttribute("data-state","pause");
                audioCtx.resume().then( ()=> {
                    video.play(); 
                    BarTimer = setInterval(() => { MoveProgBar(); }, 20); 
                });
            }
            else if(playBut.getAttribute("data-state") === "pause"){
                playBut.setAttribute("data-state","play");
                video.pause(); 
                clearInterval(BarTimer);
            } else{
                playBut.setAttribute("data-state","pause");
                video.pause();
                video.currentTime = 0;
                video.play(); 
                BarTimer = setInterval(() => { MoveProgBar(); }, 20); 
            }
            singleClick= false;
        }, dbDelay);
    }else{
        clearTimeout( dbClickTimer );
        FullScrHandler(e);
    }
}

// Sound 
video.addEventListener("wheel",(e)=>{
    e.preventDefault();
    if (e.deltaY < 0) {
        SetVolumeSettings( {clientX : barOffsetLeft + volPin.offsetLeft + volumeStep } );        
    } else {
        SetVolumeSettings( {clientX : barOffsetLeft + volPin.offsetLeft - volumeStep } );        
    }
}, {passive:false});
volBut.addEventListener("click",(e)=>{
    let state = vol.getAttribute("data-state");
    if( state === "muted" ){
        SetVolumeSettings( {clientX : barOffsetLeft + halfBarWidth } );        
    }else {
        SetVolumeSettings(e);
    }
});
volBar.addEventListener('mousedown', e => {
    e.preventDefault()
    SetVolumeSettings(e);
    document.onmousemove= SetVolumeSettings;
    document.onmouseup= MouseUp;
}, {passive:false});

function SetVolumeSettings(e){
    let x = e.clientX - barOffsetLeft;
    let diff;
    if( x <= 0){
        diff = 0;
        vol.setAttribute("data-state","muted");
    }
    else if( x >= barWidth ){
        diff = barWidth;
    }else{
        diff = x;
    }
    Vol_Colors_Gain(diff);
    volPin.style.left = diff + "px";
}
function Vol_Colors_Gain( diff ){
    let normBarsCol;
    let extBarsCol;
    let upperHalf = diff - halfBarWidth;
    if( upperHalf > 0 ){
        vol.setAttribute("data-state","extreme");
        gain = ( upperHalf / halfBarWidth ) * (maxGain-1);
        gain++; // adding the 1 for the normal volume
        normBarsCol = 50;
        extBarsCol = ( upperHalf * 100) / barWidth ;
        volIndic.innerHTML = Math.round(
            1.20314*Math.pow(10,-7)*Math.pow(gain,7)
           +0.00000148274*Math.pow(gain,6)
           -0.000589567*Math.pow(gain,5)
           +0.018608244*Math.pow(gain,4)
           -0.135460067*Math.pow(gain,3)
           -1.973545971*Math.pow(gain,2)
           +55.65688507*Math.pow(gain,1)
           +46.43410069
       ) +"%"; 
    }else{
        if(diff > halfBarWidth/2 ){
            vol.setAttribute("data-state","full");
        } else if( diff > 0 ){
            vol.setAttribute("data-state","half");
        }
        gain = diff / halfBarWidth;
        volIndic.innerHTML = Math.round( gain * 100 ) + "%";
        normBarsCol = diff;
        extBarsCol = 0;
    }
    console.log(gain)            
    AudioGainNode.gain.value = gain;
    Show_Hide_VolIndic();
    volBar.style.setProperty("--vol-Normal", normBarsCol + "%");
    volBar.style.setProperty("--vol-Extreme",extBarsCol  + "%");
}

function Show_Hide_VolIndic() {
    showIndicator = !showIndicator;
    if (showIndicator){
        volIndic.style.display = "block";
        indicatorTimeout = setTimeout(() => {
            volIndic.style.display = "none";
            showIndicator = false;
        }, 1000);
    }else{
        clearTimeout(indicatorTimeout);
    }
}
function MouseUp(e) {
    document.onmousemove= null;
    document.onmouseup= null;
}
function AudioGain( audioSource ){
    let source = audioCtx.createMediaElementSource(audioSource);
    let gainNode = audioCtx.createGain();
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    return gainNode;
}
// Fullscreen
fsBut.addEventListener("click",FullScrHandler);
document.addEventListener('fullscreenchange', event => {
    if( document.fullscreenElement === videoPlayerCont){
        fsBut.setAttribute("data-state","full");
    } 
    else if( !document.fullscreenElement ){
        fsBut.setAttribute("data-state","nofull");
    }
});
function FullScrHandler(e){
    if( document.fullscreenElement === videoPlayerCont){
        document.exitFullscreen();
    } 
    else if( !document.fullscreenElement){
        videoCont.requestFullscreen();
    }
}
// Picture-in-Picture
pip.addEventListener("click",PipHandler);
addEventListener('leavepictureinpicture', event => { 
    pip.setAttribute("data-state","disabled");
});
function PipHandler(){
    if(document.pictureInPictureElement === null && document.pictureInPictureEnabled){
        pip.setAttribute("data-state","enabled");
        video.requestPictureInPicture();
    } else if(document.pictureInPictureElement === video){
        pip.setAttribute("data-state","disabled");
        document.exitPictureInPicture();
    }
}
