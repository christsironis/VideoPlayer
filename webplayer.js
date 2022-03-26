let videoCont = document.querySelector("#videoPlayerCont");
let video = document.querySelector("#videoPlayer");
let playBut = document.querySelector("#playpause");
let playButPath = playBut.querySelector("#play");
let vol = document.querySelector("#volume");
let volBut = document.querySelector("#volume #vol-but");
let volPin = document.querySelector("#volume #vol-percent-bar #vol-pin");
let currentTime = document.querySelector("#currentTime");
let totalTime = document.querySelector("#totalTime");
let subs = document.querySelector("#subs");
let settings = document.querySelector("#settings");
let pip = document.querySelector("#pip");
let fsBut = document.querySelector("#fullscreen");
let fsButPaths = document.querySelectorAll("#fullscreen path");
let progBarPin = document.querySelector("#progress-bar #bar-pin");

// function AudioGain( audio, x ){
    let audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    let source = audioCtx.createMediaElementSource(video);
    let gainNode = audioCtx.createGain();
    source.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    gainNode.gain.value = 1;
// }
// AudioGain( video, 15 )

// video.volume=0.2;
if(gainNode.gain.value > 1){

    console.log((gainNode.gain.value /15)*50 +50)
    volPin.style.setProperty("--volumePos",(gainNode.gain.value /15)*50+ 50+"px");
}else{
    console.log(gainNode.gain.value*50)
    volPin.style.setProperty("--volumePos",(gainNode.gain.value )*50+"px");

}


playBut.addEventListener("click",PlayHandler);
video.addEventListener('play', (event) => {
    playBut.setAttribute("data-state","pause");
});
video.addEventListener('pause', (event) => {
    playBut.setAttribute("data-state","play");
});
function PlayHandler(){
    if(playBut.getAttribute("data-state") === "play"){
        video.play();
    } else{
        video.pause();
    }
}

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
