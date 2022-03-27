let videoCont = document.querySelector("#videoPlayerCont");
let video = document.querySelector("#videoPlayer");
let playBut = document.querySelector("#playpause");
let playButPath = playBut.querySelector("#play");
let vol = document.querySelector("#volume");
let volBut = document.querySelector("#volume #vol-but");
let volBar = document.querySelector("#volume #vol-percent-bar");
let volPin = document.querySelector("#volume #vol-percent-bar #vol-pin");
let currentTime = document.querySelector("#currentTime");
let totalTime = document.querySelector("#totalTime");
let subs = document.querySelector("#subs");
let settings = document.querySelector("#settings");
let pip = document.querySelector("#pip");
let fsBut = document.querySelector("#fullscreen");
let fsButPaths = document.querySelectorAll("#fullscreen path");
let progBarPin = document.querySelector("#progress-bar #bar-pin");
let barWidth = Math.round( volBar.clientWidth ) || 100;
let halfBarWidth = Math.round( barWidth / 2 );
let barOffsetLeft = Math.ceil( volBar.offsetLeft + (volPin.clientWidth/2 || 7.5) );
let maxGain = 15;
let volMagicNum = maxGain / halfBarWidth;
let gain = 1;

let AudioGainNode = AudioGain( video, 15 );
SetVolumeSettings( {clientX : barOffsetLeft + halfBarWidth } );

// Sound 
volBut.addEventListener("click",(e)=>{
    let state = vol.getAttribute("data-state");
    if( state !== "muted" ){
        SetVolumeSettings(e);
    }else {
        SetVolumeSettings( {clientX : barOffsetLeft + halfBarWidth } );        
    }
});
volBar.addEventListener('mousedown', e => {
    e.preventDefault()
    SetVolumeSettings(e);
    document.onmousemove= SetVolumeSettings;
    document.onmouseup= MouseUp;
}, {passive:false});

function SetVolumeSettings(e){

    let volume = SetVolPin( e.clientX );
    Vol_Colors_Gain(volume);
    volPin.style.left = volume + "px";
}
function SetVolPin( x ){
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
    return volume;
}
function Vol_Colors_Gain( volume ){
    let normBarsCol;
    let extBarsCol;
    if(volume > halfBarWidth){
        vol.setAttribute("data-state","extreme")
        gain = (volume - halfBarWidth) * volMagicNum;
        normBarsCol = (halfBarWidth * 100) / barWidth;
        extBarsCol = ((volume - halfBarWidth) * 100) / barWidth ;
    }else{
        if(volume > 25 ){
            vol.setAttribute("data-state","full");
        } else if( volume > 0 ){
            vol.setAttribute("data-state","half");
        }
        gain = volume * ( 1 / halfBarWidth);
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
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let source = audioCtx.createMediaElementSource(audioSource);
    let gainNode = audioCtx.createGain();
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    return gainNode;
}
playBut.addEventListener("click",PlayHandler);
video.addEventListener("click",PlayHandler);
video.addEventListener('ended', (event) => {
    playBut.setAttribute("data-state","replay");
});
function PlayHandler(){
    if(playBut.getAttribute("data-state") === "play"){
        playBut.setAttribute("data-state","pause");
        video.play();
    }
    else if(playBut.getAttribute("data-state") === "pause"){
        playBut.setAttribute("data-state","play");
        video.pause();
    } else{
        playBut.setAttribute("data-state","pause");
        video.pause();
        video.currentTime = 0;
        video.play();
    }
}
// video.addEventListener('play', (event) => {
//     playBut.setAttribute("data-state","pause");
// });
// video.addEventListener('pause', (event) => {
//     playBut.setAttribute("data-state","play");
// });

fsBut.addEventListener("click",FullScrHandler);
video.addEventListener("dblclick",FullScrHandler);
addEventListener('fullscreenchange', event => {
    if( document.fullscreenElement === videoPlayerCont){
        fsBut.setAttribute("data-state","nofull");
    } 
    else if(document.fullscreenElement === null){
        fsBut.setAttribute("data-state","full");
    }
});
function FullScrHandler(){
    if( document.fullscreenElement === videoPlayerCont){
        document.exitFullscreen();
    } 
    else if(document.fullscreenElement === null){
        videoCont.requestFullscreen();
    }
}

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
