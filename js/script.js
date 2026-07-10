
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
 
    // folder yahan "songs/dhurandhar" jaisa aata hai, isliye info.json ka path bhi wahi rahega
    let a = await fetch(`/${folder}/info.json`);
    let data = await a.json();
 
    songs = data.songs || []
 
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
 
    // yahan directory-listing wale fetch ki jagah albums.json use ho raha hai
    let a = await fetch(`/songs/albums.json`);
    let folders = await a.json();
 
    let cardContainer = document.querySelector(".cardContainer")
    cardContainer.innerHTML = "";
 
    for (const folder of folders) {
 
        let res = await fetch(`/songs/${folder}/info.json`);
        let response = await res.json();
 
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
                icon.src = "img/music.svg"
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
            playMusic(songs[index + 1])
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
 
 
}
 
 
 
main()