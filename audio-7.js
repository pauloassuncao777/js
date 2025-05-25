/*  █████  WAVE SURFER PLAYER – compatível com parser do Typebot  █████ */
(function () {
  /* ---------- 1. CSS (injeção via <style>) ---------- */
  var css =
    "@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');\n" +
    ".audio-container{display:flex;align-items:center;justify-content:flex-start;width:100%;max-width:600px;padding:10px;box-sizing:border-box;border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,.1);position:relative;height:60px;background:#1f2c33;font-family:'Open Sans',sans-serif}\n" +
    ".audio-container img{border-radius:50%;width:48px;height:48px;object-fit:cover}\n" +
    ".waveform{flex-grow:1;height:47px;margin:0 22px 0 10px;position:relative}\n" +
    ".waveform canvas{position:absolute;top:0;left:0}\n" +
    ".play-button{cursor:pointer;background:transparent;border:0;display:flex;align-items:center;justify-content:center;width:31px;height:31px;margin:-15px 8px 0 0;transition:transform .3s}\n" +
    ".play-button:hover{transform:scale(1.2)}\n" +
    ".audio-duration{font-size:13px;color:#8c949c;white-space:nowrap;position:absolute;bottom:2px;left:10px;margin-left:-8px}\n" +
    "#cursor-dot{position:absolute;top:50%;left:0;width:10px;height:10px;background:#4cc4f4;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none}\n" +
    ".microphone-icon{position:absolute;right:40px;bottom:-5px;color:#0cd464}\n" +
    ".microphone-icon svg{width:27px;height:26px}\n" +
    "@media(prefers-color-scheme:dark){.audio-duration{color:#ccc}}\n";

  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ---------- 2. carrega Wavesurfer ---------- */
  function loadScript(src, cb) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = cb;
    document.head.appendChild(s);
  }

  function start() {
    if (window.WaveSurfer) init();
    else loadScript("https://unpkg.com/wavesurfer.js", init);
  }

  /* ---------- 3. observa o DOM por <audio> ---------- */
  function init() {
    convertAudios();
    new MutationObserver(convertAudios)
      .observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- 4. converte cada <audio> ---------- */
  var avatar   = "https://database-typebot.com/iframe/Perfil-7.png";
  var players  = [];

  function convertAudios() {
    var list = document.querySelectorAll("audio[src]:not([data-wave])");
    list.forEach(function (audio) {
      audio.setAttribute("data-wave", "done");
      buildPlayer(audio);
    });
  }

  function buildPlayer(audioEl) {
    /* estrutura HTML */
    var container = document.createElement("div");
    container.className = "audio-container";
    container.innerHTML =
      '<button class="play-button" aria-label="play">' +
        '<svg class="play-icon" viewBox="0 0 34 34" width="34" height="34">' +
          '<path fill="#8c949c" d="M8.5,8.7c0-1.7,1.2-2.4,2.6-1.5l14.4,8.3c1.4,0.8,1.4,2.2,0,3L11.1,26.6c-1.4,0.8-2.6,0.2-2.6-1.5V8.7z"/>' +
        '</svg>' +
        '<svg class="pause-icon" viewBox="0 0 34 34" width="34" height="34" style="display:none">' +
          '<path fill="#8c949c" d="M9.2,25c0,0.5,0.4,1,0.9,1h3.6c0.5,0,0.9-0.4,0.9-1V9c0-0.5-0.4-0.9-0.9-0.9h-3.6' +
          'C9.7,8,9.2,8.4,9.2,9V25z M20.2,8c-0.5,0-1,0.4-1,0.9V25c0,0.5,0.4,1,1,1h3.6c0.5,0,1-0.4,1-1V9c0-0.5-0.4-0.9-1-0.9' +
          'C23.8,8,20.2,8,20.2,8z"/>' +
        '</svg>' +
      '</button>' +
      '<div class="waveform"></div>' +
      '<div id="cursor-dot"></div>' +
      '<div class="audio-duration">00:00</div>' +
      '<img src="' + avatar + '" alt="perfil">' +
      '<div class="microphone-icon">' +
        '<svg viewBox="0 0 19 26">' +
          '<path fill="#ffffff" d="M9.217,24.4c-1.158,0-2.1-.94-2.1-2.1v-2.366c-2.646-.848-4.652-3.146-5.061-5.958l-.053-1.404' +
          'c-.021-.559.182-1.088.571-1.492.39-.404.939-.637 1.507-.637h.3c.254,0,.498.044.724.125V5.265C5.103,2.913,7.016,1,9.367,1' +
          's4.265,1.913,4.265,4.265v6.271c.226-.081.469-.125.723-.125h.3c.564,0,1.112.233,1.501.64s.597.963.571,1.526' +
          'c0,.005.001.124-.08.6-0.47,2.703-2.459,4.917-5.029,5.748v2.378c0,1.158-.942,2.1-2.1,2.1H9.217Z"/>' +
          '<path fill="currentColor" d="M9.367 15.668c1.527 0 2.765-1.238 2.765-2.765V5.265c0-1.527-1.238-2.765-2.765-2.765' +
          'S6.603 3.738 6.603 5.265v7.638c0 1.527 1.237 2.765 2.764 2.765z"/>' +
        '</svg>' +
      '</div>';

    audioEl.parentElement.appendChild(container);
    audioEl.style.display = "none";

    /* Wavesurfer */
    var wave = WaveSurfer.create({
      container: container.querySelector(".waveform"),
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
    players.push(wave);

    /* refs */
    var btn   = container.querySelector(".play-button");
    var playI = container.querySelector(".play-icon");
    var pauseI= container.querySelector(".pause-icon");
    var mic   = container.querySelector(".microphone-icon");
    var dur   = container.querySelector(".audio-duration");
    var dot   = container.querySelector("#cursor-dot");
    var full  = 0;

    /* play / pause (só um por vez) */
    btn.addEventListener("click", function () {
      if (wave.isPlaying()) { wave.pause(); return; }
      players.forEach(function (p) { if (p !== wave) p.pause(); });
      wave.play();
    });

    wave.on("ready", function () { full = wave.getDuration(); dur.textContent = fmt(full); });
    wave.on("play",  function () { playI.style.display="none"; pauseI.style.display="block"; mic.style.color="#2cacdc"; });
    wave.on("pause", function () { playI.style.display="block"; pauseI.style.display="none"; mic.style.color="#0cd464"; dur.textContent = fmt(full); });
    wave.on("finish",function () { playI.style.display="block"; pauseI.style.display="none"; mic.style.color="#0cd464"; dot.style.left="0"; });
    wave.on("timeupdate", update);
    wave.on("seek", update);

    function update () {
      var cur  = wave.getCurrentTime();
      dur.textContent = fmt(cur);
      var perc = cur / (full || 1);
      dot.style.left = (perc * wave.getWrapper().clientWidth) + "px";
    }
  }

  /* util mm:ss */
  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60).toString().padStart(2, "0");
    return m + ":" + s;
  }

  /* lança */
  start();
})();
