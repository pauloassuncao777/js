/*  ███  Wavesurfer catch-all (React safe)  ███ */
(function () {
  /* ---------------- CSS ---------------- */
  var css = ".audio-container{display:flex;align-items:center;width:100%;max-width:600px;padding:10px;box-sizing:border-box;border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,.1);position:relative;height:60px;background:#1f2c33;font-family:sans-serif}.waveform{flex-grow:1;height:47px;margin:0 22px 0 10px;position:relative}.waveform canvas{position:absolute;top:0;left:0}.play-button{cursor:pointer;background:transparent;border:0;display:flex;align-items:center;justify-content:center;width:31px;height:31px;margin:-15px 8px 0 0}.audio-duration{font-size:13px;color:#8c949c;white-space:nowrap;position:absolute;bottom:2px;left:10px}.microphone-icon{position:absolute;right:40px;bottom:-5px;color:#0cd464}.microphone-icon svg{width:27px;height:26px}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ------------- carrega Wavesurfer ------------- */
  function loadJS(src, cb) {
    if (window.WaveSurfer) return cb();
    var s = document.createElement("script");
    s.src = src;
    s.onload = cb;
    document.head.appendChild(s);
  }

  loadJS("https://unpkg.com/wavesurfer.js", start);

  /* ------------- player map & helpers ------------- */
  var players = {};                // chave: audioEl => WaveSurfer
  var avatar  = "https://database-typebot.com/iframe/Perfil-7.png";

  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60).toString().padStart(2, "0");
    return m + ":" + s;
  }

  /* ------------- substitui um <audio> ------------- */
  function replace(audioEl) {
    if (players[audioEl]) return;          // já trocado

    var box = document.createElement("div");
    box.className = "audio-container";
    box.innerHTML =
      '<button class="play-button">' +
        '<svg class="play" viewBox="0 0 34 34" width="34" height="34"><path fill="#8c949c" d="M8.5 8.7c0-1.7 1.2-2.4 2.6-1.5l14.4 8.3c1.4.8 1.4 2.2 0 3L11.1 26.6c-1.4.8-2.6.2-2.6-1.5V8.7z"/></svg>' +
        '<svg class="pause" viewBox="0 0 34 34" width="34" height="34" style="display:none"><path fill="#8c949c" d="M9 25h4V9H9zm11-16h4v16h-4z"/></svg>' +
      '</button>' +
      '<div class="waveform"></div>' +
      '<div id="cursor-dot" style="position:absolute;top:50%;left:0;width:10px;height:10px;background:#4cc4f4;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none"></div>' +
      '<div class="audio-duration">00:00</div>' +
      '<img src="'+avatar+'" style="border-radius:50%;width:48px;height:48px;object-fit:cover">';

    audioEl.parentElement.insertBefore(box, audioEl);
    audioEl.style.display = "none";

    var wave = WaveSurfer.create({
      container: box.querySelector(".waveform"),
      waveColor: "#4c545c",
      progressColor: "#b8c4c7",
      barWidth: 3,
      barHeight: 3,
      barRadius: 2,
      height: 47,
      responsive: true,
      cursorWidth: 0
    });
    wave.load(audioEl.src);
    players[audioEl] = wave;              // guarda referência

    var btn   = box.querySelector(".play-button");
    var playI = box.querySelector(".play");
    var pauseI= box.querySelector(".pause");
    var dur   = box.querySelector(".audio-duration");
    var dot   = box.querySelector("#cursor-dot");
    var len   = 0;

    btn.onclick = function () {
      Object.keys(players).forEach(function (a) {
        if (players[a] !== wave) players[a].pause();
      });
      wave.isPlaying() ? wave.pause() : wave.play();
    };

    wave.on("ready", function () { len = wave.getDuration(); dur.textContent = fmt(len); });
    wave.on("play",  function () { playI.style.display="none"; pauseI.style.display="block"; });
    wave.on("pause", function () { playI.style.display="block"; pauseI.style.display="none"; dur.textContent = fmt(len); });
    wave.on("finish",function () { playI.style.display="block"; pauseI.style.display="none"; dot.style.left="0"; });
    wave.on("timeupdate", update); wave.on("seek", update);

    function update() {
      var t = wave.getCurrentTime();
      dur.textContent = fmt(t);
      dot.style.left = (t/len)*wave.getWrapper().clientWidth + "px";
    }
  }

  /* ------------- observa e loop infinito ------------- */
  function scan() {
    document.querySelectorAll("audio[src]").forEach(replace);
  }

  function start() {
    /* 1) MutationObserver para inserções “limpas” */
    new MutationObserver(function (muts) {
      muts.forEach(function (rec) {
        rec.addedNodes.forEach(function (n) {
          if (n.tagName === "AUDIO") replace(n);
          if (n.querySelectorAll) n.querySelectorAll("audio[src]").forEach(replace);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });

    /* 2) Fallback: a cada 400 ms procura áudios criados pelo React */
    setInterval(scan, 400);
    scan(); // rodada inicial
  }
})();
