const frames = ['bird1.png', 'bird2.png', 'bird3.png', 'bird4.png'];
const restFrame = 'bird_rest.png';

const frameRate = 12;
const frameInterval = 1000 / frameRate;
const speed = 2;
const delayBetween = 300000;

let startTime = null;
let targetDuration = null;
let birdsLanded = 0;
let timerAnimationId = null;
let birdHasFlown = false;
let mode = null;
let escapeTime = null;

// 効果音の読み込み
const flySound = new Audio('hatofly.mp3');

function chooseMokupiyo() {
  mode = "mokupiyo";
  document.getElementById("mode-select").style.display = "none";
  document.getElementById("target-time-input").style.display = "block";
}

function chooseMorimori() {
  mode = "morimori";
  document.getElementById("mode-select").style.display = "none";
  document.getElementById("timer").style.display = "block";

  setTimeout(() => {
    startPiyomori();
    activateEndTriggers();
  }, 300);
}

function startMokupiyo() {
  const minutes = parseInt(document.getElementById("target-minutes").value);
  if (!minutes || minutes < 1) return;
  targetDuration = minutes * 60 * 1000;

  document.getElementById("target-time-input").style.display = "none";
  document.getElementById("timer").style.display = "block";
  startPiyomori();

  setTimeout(activateEndTriggers, 1000);
}

function startPiyomori() {
  startTime = Date.now();
  spawnBirds();

  let goalReached = false;

  function updateTimer() {
    const now = Date.now();
    const elapsed = now - startTime;
    const totalSeconds = Math.floor(elapsed / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    document.getElementById("timer").textContent = `経過時間：${minutes}:${seconds}`;

    if (mode === "mokupiyo" && !goalReached && elapsed >= targetDuration) {
      goalReached = true;
      showGoalMessage();
    }

    timerAnimationId = requestAnimationFrame(updateTimer);
  }

  updateTimer();
}

function showGoalMessage() {
  const existing = document.getElementById("goal-message");
  if (existing) return;

  const message = document.createElement('div');
  message.id = "goal-message";
  message.textContent = "目標達成！";
  message.style.position = 'fixed';
  message.style.top = '56px';
  message.style.right = '20px';
  message.style.fontFamily = "'Yomogi', cursive";
  message.style.color = "#ffffff";
  message.style.fontSize = "20px";
  message.style.whiteSpace = 'nowrap';
  message.style.zIndex = 1001;
  document.body.appendChild(message);

  // ★ここで音を鳴らす！
  const sound = document.getElementById("goal-sound");
  if (sound) {
    sound.currentTime = 0;
    sound.play().catch(e => console.log("再生エラー:", e));
  }
}


function spawnBirds() {
  function createAndRepeat(index) {
    if (birdHasFlown) return;
    createBird(index);
    setTimeout(() => createAndRepeat(index + 1), delayBetween);
  }
  createAndRepeat(0);
}

function createBird(index) {
  if (birdHasFlown) return;
  const bird = document.createElement('div');
  bird.className = 'bird';
  document.body.appendChild(bird);

  let posX = window.innerWidth + 100;
  const targetX = Math.random() * (window.innerWidth - 100);
  const baseY = window.innerHeight * (0.1 + Math.random() * 0.8);

  const scale = 0.85 + Math.random() * 0.3;
  bird.style.transform = `translateY(-50%) scale(${scale})`;

  let frameIndex = 0;
  let time = 0;
  let flying = true;
  let lastFrameTime = performance.now();

  bird.style.left = posX + 'px';
  bird.style.top = baseY + 'px';
  bird.style.backgroundImage = `url('${frames[0]}')`;

  function animateBird() {
    const now = performance.now();

    if (flying) {
      if (now - lastFrameTime >= frameInterval) {
        frameIndex = (frameIndex + 1) % frames.length;
        bird.style.backgroundImage = `url('${frames[frameIndex]}')`;
        lastFrameTime = now;
      }

      if (posX > targetX) {
        posX -= speed;
        bird.style.left = posX + 'px';
        time += 0.05;
        const offsetY = Math.sin(time) * 30;
        bird.style.top = baseY + offsetY + 'px';
      } else {
        flying = false;
        bird.style.left = targetX + 'px';
        bird.style.top = baseY + 'px';
        bird.style.backgroundImage = `url('${restFrame}')`;
        birdsLanded++;
      }
    }

    requestAnimationFrame(animateBird);
  }

  animateBird();
}

function flyAwayBirds() {
  if (birdHasFlown) return;
  birdHasFlown = true;

  // 効果音を鳴らす
  flySound.currentTime = 0;
  flySound.play();

  cancelAnimationFrame(timerAnimationId);
  escapeTime = Date.now();

  const birds = document.querySelectorAll('.bird');
  birds.forEach(bird => {
    let frame = 0;
    const flapping = setInterval(() => {
      frame = (frame + 1) % frames.length;
      bird.style.backgroundImage = `url('${frames[frame]}')`;
    }, 50);

    const angle = Math.random() * Math.PI * 2;
    const flySpeed = 300 + Math.random() * 200;
    const dx = Math.cos(angle) * flySpeed;
    const dy = Math.sin(angle) * flySpeed;

    bird.style.transition = 'transform 1s ease, opacity 1s ease';
    bird.style.transform = `translate(${dx}px, ${dy}px) rotate(${(Math.random() * 60 - 30)}deg)`;
    bird.style.opacity = 0;

    setTimeout(() => {
      clearInterval(flapping);
      bird.remove();
    }, 1000);
  });

  setTimeout(() => {
    const message = document.createElement('div');
    message.textContent = "ぴよは森に飛び去った。";
    message.style.position = 'fixed';
    message.style.top = '40%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.fontFamily = "'Yomogi', cursive";
    message.style.color = "#ffffff";
    message.style.fontSize = "32px";
    message.style.whiteSpace = 'nowrap';
    message.style.zIndex = 2000;
    message.style.opacity = '0';
    message.style.transition = 'opacity 0.5s ease';
    document.body.appendChild(message);

    setTimeout(() => {
      message.style.opacity = '1';
    }, 10);

    setTimeout(() => {
      message.style.opacity = '0';
      setTimeout(() => {
        message.remove();
        showResult();
      }, 500);
    }, 1000);
  }, 1200);
}

function showResult() {
  const now = escapeTime || Date.now();
  const elapsed = now - startTime;
  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  document.getElementById("result-time").textContent = `すごした時間：${minutes}分${seconds}秒`;
  document.getElementById("result-birds").textContent = `集まったぴよ：${birdsLanded}羽`;
  document.getElementById("result").style.display = "block";
}

function restartPiyomori() {
  location.reload();
}

function activateEndTriggers() {
  ['click', 'touchstart', 'scroll', 'keydown'].forEach(evt => {
    window.addEventListener(evt, flyAwayBirds, { once: true });
  });
}

function toggleExplanation(id) {
  const el = document.getElementById(id);
  if (el.style.display === 'none' || !el.style.display) {
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

window.chooseMorimori = chooseMorimori;
window.chooseMokupiyo = chooseMokupiyo;
window.startMokupiyo = startMokupiyo;
window.restartPiyomori = restartPiyomori;
window.toggleExplanation = toggleExplanation;
