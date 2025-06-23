const frames = ['bird1.png', 'bird2.png', 'bird3.png', 'bird4.png'];
const restFrame = 'bird_rest.png';

const frameRate = 12;
const frameInterval = 1000 / frameRate;
const speed = 2;
const delayBetween = 10000;
const numBirds = 3;

let startTime = null;
let targetDuration = null;
let birdsLanded = 0;
let timerAnimationId = null;
let birdHasFlown = false;
let mode = null;

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
  createBird(0);
  for (let i = 1; i < numBirds; i++) {
    setTimeout(() => createBird(i), i * delayBetween);
  }

  function updateTimer() {
    const now = Date.now();
    const elapsed = now - startTime;
    const totalSeconds = Math.floor(elapsed / 1000);
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    document.getElementById("timer").textContent = `経過時間：${minutes}:${seconds}`;

    if (mode === "mokupiyo" && elapsed >= targetDuration) {
      flyAwayBirds();
      return;
    }

    timerAnimationId = requestAnimationFrame(updateTimer);
  }

  updateTimer();
}

function createBird(index) {
  const bird = document.createElement('div');
  bird.className = 'bird';
  bird.id = `bird${index}`;
  document.body.appendChild(bird);

  let posX = window.innerWidth + 100;
  const targetX = window.innerWidth / 2 - (numBirds * 55) + index * 110;
  const baseY = window.innerHeight / 2 + (index % 2 === 0 ? -40 : 40);

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
        const offsetY = Math.sin(time) * 20;
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
  cancelAnimationFrame(timerAnimationId);

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
    message.textContent = "逃げちゃった...";
    message.style.position = 'fixed';
    message.style.top = '40%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.background = 'rgba(255,255,255,0.9)';
    message.style.padding = '20px 40px';
    message.style.borderRadius = '20px';
    message.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    message.style.fontSize = '24px';
    message.style.zIndex = 2000;
    document.body.appendChild(message);

    setTimeout(() => {
      message.remove();
      showResult();
    }, 1000);
  }, 1200);
}

function showResult() {
  const now = Date.now();
  const elapsed = now - startTime;
  const totalSeconds = Math.floor(elapsed / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  document.getElementById("result-time").textContent = `集中できた時間：${minutes}分${seconds}秒`;
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

window.chooseMorimori = chooseMorimori;
window.chooseMokupiyo = chooseMokupiyo;
window.startMokupiyo = startMokupiyo;
window.restartPiyomori = restartPiyomori;
