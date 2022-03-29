let videoCont = document.querySelector("#videoPlayerCont");
let video = document.querySelector("#videoPlayer");
let playBut = document.querySelector("#playpause");
let vol = document.querySelector("#volume");
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
let barOffsetLeft = Math.ceil( volBar.offsetLeft + (volPin.clientWidth/2 || 7.5) );
let gain = 1;
let maxGain = 15;
let GainMagicNum = maxGain / halfBarWidth;
let volumeStep = barWidth/20;
let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let AudioGainNode = AudioGain( video, maxGain );
// Timeline Variables
let BarTimer;
let currentTime = 0;
let hoveredTime;

// Initialization
video.addEventListener('loadedmetadata', (event) => {
    totalTime.innerHTML = VidDurationFormat( video.duration );
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
        progBarLabel.innerHTML = VidDurationFormat(hoveredTime); 
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
function VidDurationFormat(sec) {
    let min = Math.floor(sec / 60);
    min = (min >= 10 || min === 0) ? min : "0" + min;
    sec = Math.round(sec % 60);
    sec = (sec >= 10 || sec === 0) ? sec : "0" + sec;
    return min + ":" + sec;
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
    let x = e.clientX
    let volume;
    if(barOffsetLeft >= x){
        volume = 0;
        vol.setAttribute("data-state","muted");
    }
    else if( x >= barOffsetLeft + barWidth ){
        volume = barWidth;
    }else{
        volume = x - barOffsetLeft;
    }
    Vol_Colors_Gain(volume);
    volPin.style.left = volume + "px";
}
function Vol_Colors_Gain( volume ){
    let normBarsCol;
    let extBarsCol;
    if(volume > halfBarWidth){
        vol.setAttribute("data-state","extreme");
        gain = (volume - halfBarWidth) * GainMagicNum;
        normBarsCol = (halfBarWidth * 100) / barWidth;
        extBarsCol = ((volume - halfBarWidth) * 100) / barWidth ;
    }else{
        if(volume > halfBarWidth/2 ){
            vol.setAttribute("data-state","full");
        } else if( volume > 0 ){
            vol.setAttribute("data-state","half");
        }
        gain = volume / halfBarWidth;
        normBarsCol = volume;
        extBarsCol = 0;
    }
    AudioGainNode.gain.value = gain;
    volBar.style.setProperty("--vol-Normal", normBarsCol + "%");
    volBar.style.setProperty("--vol-Extreme",extBarsCol  + "%");
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

// Play - Pause - Replay
playBut.addEventListener("click",PlayHandler);
video.addEventListener("click",PlayHandler);
video.addEventListener('ended', (event) => {
    playBut.setAttribute("data-state","replay");
    setTimeout(()=> clearInterval(BarTimer) ,50);
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


// Fullscreen
fsBut.addEventListener("click",FullScrHandler);
document.addEventListener('fullscreenchange', event => {
    if( document.fullscreenElement === videoPlayerCont){
        fsBut.setAttribute("data-state","nofull");
    } 
    else if(document.fullscreenElement === null){
        fsBut.setAttribute("data-state","full");
    }
});
function FullScrHandler(e){
    if( document.fullscreenElement === videoPlayerCont){
        document.exitFullscreen();
    } 
    else if(document.fullscreenElement === null){
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
