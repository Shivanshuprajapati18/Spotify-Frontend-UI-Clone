console.log("Starting Javascript")
let songs;
let currentFolder;

let showplaybar = document.getElementById("playbar");

function formatTime(seconds) {

    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let minutes = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    let formattedMinutes = String(minutes).padStart(2, "0");
    let formattedSeconds = String(secs).padStart(2, "0");

    return formattedMinutes + ":" + formattedSeconds;
}




let currentSong = new Audio();
const playMusic = (track) => {
    // let audio = new Audio("/songs/" + track)
    currentSong.src = `/${currentFolder}/` + track
    currentSong.play()
    play.src = "img/pause.svg";
    document.querySelector(".playbar-songinfo").innerHTML = track.replaceAll("%20", " ").replaceAll(".mp3", " ")
    document.querySelector(".duration").innerHTML = "00:00/00:00"

    showplaybar.classList.add("show")

    document.querySelectorAll(".songlist li").forEach(li => {
        let icon = li.querySelector(".wave-icon")
        if (li.getAttribute("data-filename") === track) {
            icon.src = "img/icons8-audio-wave.gif"  
        } else {
            icon.src = "img/music.svg"                
        }
    })

}




async function getsongs(folder) {
    currentFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();


    let div = document.createElement("div")
    div.innerHTML = response

    let as = div.getElementsByTagName("a")


    songs = []

    for (let index = 0; index < as.length; index++) {

        const element = as[index];
        if (element.href.endsWith(".mp3")) {

            let cleanHref = element.href.replaceAll("%5C", "/")
            songs.push(cleanHref.split(`/${folder}/`)[1])

        }
    }


    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {

        songUL.innerHTML = songUL.innerHTML + `<li data-filename="${song}">
    <img class="invert wave-icon" src="img/music.svg" alt="">
    <div class="songinfo">
        <div>${song.replaceAll("%20", " ").replaceAll(".mp3", " ")}</div>
        <div></div>
    </div>
    <div class="playnow">
        <span>Play Now</span>
        <img class="invert" src="img/play.svg" alt="">
    </div>
</li>`;

    }

return songs

}

async function displayAlbum() {

    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)


        for (let index = 0; index < array.length; index++) {
            const e = array[index];
            
        
        let cleanHref = e.href.replaceAll("%5C", "/")
        if (e.href.includes("%5Csongs")) {
            let folder = (cleanHref.split("/").filter(Boolean).slice(-1)[0])

            // get the metadata of the folder
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" class="card">
                        <div class="play">
                            <div
                                style="width:45px;height:45px;background:#1DB954;border-radius:50%;display:flex;justify-content:center;align-items:center;cursor:pointer;">
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="black"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M8 5V19L19 12L8 5Z" />
                            </svg>
                        </div>
                    </div>
                    
                    
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.Title}</h2>
                    <p>${response.Description}</p>`
        }
        }
    
    Array.from(document.getElementsByClassName("card")).forEach(e => {
       e.addEventListener("click", async item => {

           songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);

       })
   })


}






async function main() {
songs = await getsongs("songs/dhurandhar")
    //display album on the page
    await displayAlbum()

    // Play the first song

    document.querySelector(".songlist").addEventListener("click", (e) => {
        let li = e.target.closest("li[data-filename]")
        if (!li) return
        let filename = li.getAttribute("data-filename")
        playMusic(filename)
    })


    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "img/pause.svg";
            let currentFile = decodeURIComponent(currentSong.src.split("/").pop())
        document.querySelectorAll(".songlist li").forEach(li => {
            let icon = li.querySelector(".wave-icon")
            if (decodeURIComponent(li.getAttribute("data-filename")) === currentFile) {
                icon.src = "img/icons8-audio-wave.gif"
            }
        })

        } else {
            currentSong.pause()
            play.src = "img/playbutton.svg";
            document.querySelectorAll(".songlist li").forEach(li => {
            let icon = li.querySelector(".wave-icon")
            icon.src = "music.svg"
        })

        }


    })


    // time update 


    currentSong.addEventListener("timeupdate", () => {

        document.querySelector(".duration").innerHTML = `${formatTime(currentSong.currentTime)}/ ${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

        // changing seekbar circle on click 

        document.querySelector(".seekbar").addEventListener("click", e => {
            let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
            document.querySelector(".circle").style.left = (percent + "%");
            currentSong.currentTime = ((currentSong.duration) * percent) / 100;
        })
    })


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";

    })
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })



    // previous button 
   previous.addEventListener("click", () => {
    if (!songs || songs.length === 0) return   
    let currentFile = decodeURIComponent(currentSong.src.split("/").pop())
    let index = songs.indexOf(songs.find(s => decodeURIComponent(s) === currentFile))

    if ((index - 1) >= 0) {
        playMusic(songs[index - 1])
    }
})

next.addEventListener("click", () => {
    if (!songs || songs.length === 0) return

    let currentFile = decodeURIComponent(currentSong.src.split("/").pop())
    let matched = songs.find(s => decodeURIComponent(s) === currentFile)
    let index = songs.indexOf(matched)

    if ((index + 1) < songs.length) {
        playMusic(songs[index + 1])   // 👈 yeh line missing thi
    }
})

    //adding an event listner to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("input", (e) => {

        currentSong.volume = parseInt(e.target.value) / 100
    })

    const volumeBtn = document.querySelector(".volume img");
    const rangeBox = document.querySelector(".range");

    volumeBtn.addEventListener("click", () => {
        rangeBox.classList.toggle("show");
    })


    //loading songs on palylist click 

   

}



main()