/*  ███  Wavesurfer + Shadow DOM catcher – Typebot compatible  ███ */
(function () {
  /* ---------- 0. patch attachShadow cedo ---------- */
  const shadowRoots = [];
  const origAttach  = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (init) {
    const root = origAttach.call(this, init);
    shadowRoots.push(root);
    observe(root);                 // vigia este shadow também
    return root;
  };

  /* ---------- 1. Injeta CSS ---------- */
  var css =
    ".audio-container{display:flex;align-items:center;justify-content:flex-start;width:100%;max-width:600px;padding:10px;box-sizing:border-box;border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,.1);position:relative;height:60px;background:#1f2c33;font-family:'Open Sans',sans-serif}\n" +
    ".audio-container img{border-radius:50%;width:48px;height:48px;object-fit:cover}\n" +
    ".waveform{flex-grow:1;height:47px;margin:0 22px 0 10px;position:relative}\n" +
    ".waveform canvas{position:absolute;top:0;left:0}\n" +
    ".play-button{cursor:pointer;background:transparent;border:0;display:flex;align-items:center;justify-content:center;width:31px;height:31px;margin:-15px 8px 0 0;transition:transform .3s}\n" +
    ".play-button:hover{transform:scale(1.2)}\n" +
    ".audio-duration{font-size:13px;color:#8c949c;white-space:nowrap;position:absolute;bottom:2px;left:10px;margin-left:-8px}\n" +
    "#cursor-dot{position:absolute;top:50%;left:0;width:10px;height:10px;background:#4cc4f4;border-radius:50%;transform:translate(-50%,-50%);pointer-events:none}\n" +
    ".microphone-icon{position:absolute;right:40px;bottom:-5px;color:#0cd464}\n" +
    ".microphone-icon svg{width:27px;height:26px}\n";

  var st = document.createElement("style");
  st.textContent = css;
  document.head.appendChild(st);

  /* ---------- 2. carrega Wavesurfer ---------- */
  function loadJS(src, cb) {
    if (window.WaveSurfer) return cb();
    var s = document.createElement("script");
    s.src = src;
    s.onload = cb;
    document.head.appendChild(s);
  }

  loadJS("https://unpkg.com/wavesurfer.js", start);

  /* ---------- 3. Observadores ---------- */
  const players = [];
  const avatar  = "https://database-typebot.com/iframe/Perfil-7.png";

  function start() {
    observe(document);             // DOM principal
    shadowRoots.forEach(observe);  // já capturados
  }

  function observe(root) {
    findAudios(root);              // pega os já existentes
    new MutationObserver(function (mut) {
      mut.forEach(function (rec) {
        rec.addedNodes.forEach(function (n) {
          if (n.tagName === "AUDIO") replace(n);
          // se o nó for outro elemento com filhos, procura dentro
          if (n.querySelectorAll) findAudios(n);
        });
      });
    }).observe(root, { childList: true, subtree: true });
  }

  function findAudios(scope) {
    var list = scope.querySelectorAll && scope.querySelectorAll("audio[src]:not([data-wave])");
    if (list) list.forEach(replace);
  }

  /* ---------- 4. Converte <audio> ---------- */
  function replace(audioEl) {
    if (audioEl.dataset.wave) return;
    audioEl.dataset.wave = "ok";

    var box = document.createElement("div");
    box.className = "audio-container";
    box.innerHTML =
      '<button class="play-button" aria-label="play">' +
        '<svg class="play" viewBox="0 0 34 34" width="34" height="34"><path fill="#8c949c" d="M8.5 8.7c0-1.7 1.2-2.4 2.6-1.5l14.4 8.3c1.4.8 1.4 2.2 0 3L11.1 26.6c-1.4.8-2.6.2-2.6-1.5V8.7z"/></svg>' +
        '<svg class="pause" viewBox="0 0 34 34" width="34" height="34" style="display:none"><path fill="#8c949c" d="M9.2 25c0 .5.4 1 .9 1h3.6c.5 0 .9-.4.9-1V9c0-.5-.4-.9-.9-.9H10c-.5 0-.9.4-.9.9v16zm11-17h-3.6c-.5 0-1 .4-1 .9v16c0 .5.4 1 1 1h3.6c.5 0 1-.4 1-1V9c0-.5-.4-.9-1-.9z"/></svg>' +
      '</button>' +
      '<div class="waveform"></div>' +
      '<div id="cursor-dot"></div>' +
      '<div class="audio-duration">00:00</div>' +
      '<img src="'+avatar+'" alt="perfil">' +
      '<div class="microphone-icon"><svg viewBox="0 0 19 26"><path fill="#ffffff" d="M9.2 24.4c-1.16 0-2.1-.94-2.1-2.1v-2.37c-2.65-.85-4.65-3.15-5.06-5.96l-.05-1.4c-.02-.56.18-1.09.57-1.49.39-.4.94-.64 1.5-.64h.3c.25 0 .5.04.72.13V5.27C5.1 2.91 7.02 1 9.37 1s4.27 1.91 4.27 4.27v6.27c.23-.08.47-.12.72-.12h.3c.56 0 1.11.23 1.5.64.39.4.6.96.57 1.53 0 .01.01.12-.08.6-.47 2.7-2.46 4.92-5.03 5.75v2.38c0 1.16-.94 2.1-2.1 2.1H9.2z"/><path fill="currentColor" d="M9.37 15.67c1.53 0 2.77-1.24 2.77-2.77V5.27c0-1.53-1.24-2.77-2.77-2.77S6.6 3.74 6.6 5.27v7.63c0 1.53 1.24 2.77 2.77 2.77z"/></svg></div>';

    audioEl.parentElement.insertBefore(box, audioEl);
    audioEl.style.display = "none";

    var wave = WaveSurfer.create({
      container     : box.querySelector(".waveform"),
      waveColor     : "#4c545c",
      progressColor : "#b8c4c7",
      barWidth      : 3,
      barHeight     : 3,
      barRadius     : 2,
      height        : 47,
      responsive    : true,
      cursorWidth   : 0
    });
    wave.load(audioEl.src);
    players.push(wave);

    var btn   = box.querySelector(".play-button");
    var playI = box.querySelector(".play");
    var pausI = box.querySelector(".pause");
    var mic   = box.querySelector(".microphone-icon");
    var dur   = box.querySelector(".audio-duration");
    var dot   = box.querySelector("#cursor-dot");
    var total = 0;

    btn.onclick = function () {
      if (wave.isPlaying()) { wave.pause(); return; }
      players.forEach(function (p) { if (p !== wave) p.pause(); });
      wave.play();
    };

    wave.on("ready", function () { total = wave.getDuration(); dur.textContent = fmt(total); });
    wave.on("play",  function () { playI.style.display="none"; pausI.style.display="block"; mic.style.color="#2cacdc"; });
    wave.on("pause", function () { playI.style.display="block"; pausI.style.display="none"; mic.style.color="#0cd464"; dur.textContent = fmt(total); });
    wave.on("finish",function () { playI.style.display="block"; pausI.style.display="none"; mic.style.color="#0cd464"; dot.style.left="0"; });
    wave.on("timeupdate", update);
    wave.on("seek", update);

    function update () {
      var cur = wave.getCurrentTime();
      dur.textContent = fmt(cur);
      var perc = cur / (total || 1);
      dot.style.left = (perc * wave.getWrapper().clientWidth) + "px";
    }
  }

  function fmt(sec) {
    var m = Math.floor(sec / 60);
    var s = Math.floor(sec % 60).toString().padStart(2,"0");
    return m + ":" + s;
  }
})();
