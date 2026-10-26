
const tracks = [
    {
        title: "Entombed",
        artist: "Deftones",
        src: "music/track01.mp3"
    },
    {
        title: "Be Quiet And Drive (Far Away)",
        artist: "Deftones",
        src: "music/track02.mp3"
    },
    {
        title: "Minerva",
        artist: "Deftones",
        src: "music/track03.mp3"
    }
];

const audio = document.getElementById("audio-player");
const playlist = document.getElementById("playlist");
const title = document.getElementById("track-title");
const artist = document.getElementById("track-artist");
const status = document.getElementById("player-status");
const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const seekBar = document.getElementById("seek-bar");
const volumeBar = document.getElementById("volume-bar");
const currentTime = document.getElementById("current-time");
const duration = document.getElementById("duration");
const trackCount = document.getElementById("track-count");

let currentTrack = 0;
let isSeeking = false;

audio.volume = Number(volumeBar.value);

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "00:00";
    }

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return String(mins).padStart(2, "0") + ":" +
           String(secs).padStart(2, "0");
}

function renderPlaylist() {
    playlist.innerHTML = "";

    tracks.forEach((track, index) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "playlist-track";
        button.setAttribute("aria-label", "Play " + track.title);

        const number = document.createElement("span");
        number.className = "track-number";
        number.textContent = String(index + 1).padStart(2, "0");

        const name = document.createElement("span");
        name.className = "track-name";
        name.textContent = track.title + " — " + track.artist;

        button.append(number, name);
        button.addEventListener("click", () => loadTrack(index, true));

        playlist.appendChild(button);
    });

    trackCount.textContent =
        String(tracks.length).padStart(2, "0") + " TRACKS";

    updatePlaylist();
}

function updatePlaylist() {
    [...playlist.children].forEach((item, index) => {
        const active = index === currentTrack;

        item.classList.toggle("active", active);

        if (active) {
            item.setAttribute("aria-current", "true");
        } else {
            item.removeAttribute("aria-current");
        }
    });
}

function loadTrack(index, autoplay = false) {
    currentTrack = (index + tracks.length) % tracks.length;

    const track = tracks[currentTrack];

    audio.src = track.src;
    title.textContent = track.title;
    artist.textContent = track.artist;

    currentTime.textContent = "00:00";
    duration.textContent = "00:00";
    seekBar.value = 0;

    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Play");
    status.textContent = "LOADING // PLEASE WAIT";

    updatePlaylist();

    if (autoplay) {
        playAudio();
    } else {
        audio.load();
        status.textContent = "READY // SELECT PLAY";
    }
}

async function playAudio() {
    try {
        await audio.play();
    } catch (error) {
        playBtn.textContent = "▶";
        playBtn.setAttribute("aria-label", "Play");

        if (error.name === "NotAllowedError") {
            status.textContent = "PRESS PLAY TO START";
        } else if (error.name === "NotSupportedError") {
            status.textContent = "AUDIO FORMAT NOT SUPPORTED";
        } else {
            status.textContent = "CHECK AUDIO FILE PATH";
        }
    }
}

function togglePlayback() {
    if (audio.paused) {
        playAudio();
    } else {
        audio.pause();
    }
}

playBtn.addEventListener("click", togglePlayback);

prevBtn.addEventListener("click", () => {
    loadTrack(currentTrack - 1, true);
});

nextBtn.addEventListener("click", () => {
    loadTrack(currentTrack + 1, true);
});

audio.addEventListener("play", () => {
    playBtn.textContent = "Ⅱ";
    playBtn.setAttribute("aria-label", "Pause");
    status.textContent = "NOW PLAYING // DEAD ROSES FM";
});

audio.addEventListener("pause", () => {
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Play");

    if (audio.ended) return;

    status.textContent = audio.currentTime > 0
        ? "PAUSED // WAITING"
        : "READY // SELECT PLAY";
});

audio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
    currentTime.textContent = formatTime(audio.currentTime);

    if (!isSeeking && Number.isFinite(audio.duration) &&
        audio.duration > 0) {
        seekBar.value = (audio.currentTime / audio.duration) * 100;
    }
});

seekBar.addEventListener("input", () => {
    isSeeking = true;

    if (Number.isFinite(audio.duration)) {
        currentTime.textContent = formatTime(
            (Number(seekBar.value) / 100) * audio.duration
        );
    }
});

seekBar.addEventListener("change", () => {
    if (Number.isFinite(audio.duration)) {
        audio.currentTime =
            (Number(seekBar.value) / 100) * audio.duration;
    }

    isSeeking = false;
});

volumeBar.addEventListener("input", () => {
    audio.volume = Number(volumeBar.value);
});

audio.addEventListener("ended", () => {
    loadTrack(currentTrack + 1, true);
});

audio.addEventListener("error", () => {
    status.textContent = "FILE NOT FOUND // CHECK PATH";
    playBtn.textContent = "▶";
    playBtn.setAttribute("aria-label", "Play");
});

renderPlaylist();
loadTrack(0);
