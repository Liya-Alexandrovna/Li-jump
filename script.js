const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Картинки
const fonImg = new Image(); fonImg.src = "fonimg.jpg";
const pandaImg = new Image(); pandaImg.src = "Panda.png";
const pipeImg = new Image(); pipeImg.src = "pipe.png";
const playImg = new Image(); playImg.src = "play.png";
const pauseImg = new Image(); pauseImg.src = "pause.png";
const startImg = new Image(); startImg.src = "start.png";
const gameOverImg = new Image(); gameOverImg.src = "gameOver.png";

// Размеры и физика
const platformWidth = 60;
const platformHeight = 20;
const pandaWidth = 60;
const pandaHeight = 70;
const stepY = 50;
const gravity = 0.5;
const jumpPower = -10;
const pauseX = 10;
const pauseY = 0;
const pauseSize = 50;
const btnWidth = 200;
const btnHeight = 60;
let btnY = 0;

let pandaX, pandaY;
let velocityX = 0, velocityY = 0;
let backgroundY = 0;
let maxHeight = 0;
let gameStarted = false;
let isPaused = false;
let startButton = true;
let startLoop = false;
let gameOver = false;
let animation = null;
let fourPlatforms = 0;

let platforms = [];

function resizeCanvas() {
  if (window.innerWidth <= 480) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
  } else {
    canvas.width = 400;
    canvas.height = 600;
    canvas.style.width = '400px';
    canvas.style.height = '600px';
  }

  btnY = canvas.height - 100; // пересчёт кнопки "Start"
}

function generatePlatforms() {
  platforms = [];
  const startX = (canvas.width - platformWidth) / 2;
  const startY = canvas.height - 20;
  platforms.push({ x: startX, y: startY });
  for (let i = 1; i < 30; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: startY - i * stepY,
    });
  }
}

function jump() {
  velocityY = jumpPower;
}

function drawTouchControls() {
  const size = 60;
  const y = canvas.height - size - 10;

  ctx.fillStyle = "rgba(0,0,0,0.3)";
  ctx.beginPath();
  ctx.moveTo(20 + size, y);
  ctx.lineTo(20, y + size / 2);
  ctx.lineTo(20 + size, y + size);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(canvas.width - 20 - size, y);
  ctx.lineTo(canvas.width - 20, y + size / 2);
  ctx.lineTo(canvas.width - 20 - size, y + size);
  ctx.closePath();
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bgHeight = (fonImg.height * canvas.width) / fonImg.width;
  const y = -backgroundY % bgHeight;
  for (let i = -1; i <= Math.ceil(canvas.height / bgHeight); i++) {
    ctx.drawImage(fonImg, 0, y + i * bgHeight, canvas.width, bgHeight);
  }

  for (const p of platforms) {
    ctx.drawImage(pipeImg, p.x, p.y + backgroundY, platformWidth, platformHeight);
  }

  const score = Math.floor((maxHeight + fourPlatforms) / stepY);
  ctx.fillStyle = "black";
  ctx.fillText(score, canvas.width - 50, 35);

  ctx.drawImage(pandaImg, pandaX, pandaY, pandaWidth, pandaHeight);
  ctx.fillStyle = "black";
  ctx.font = "bold 28px Italic";

  ctx.drawImage(isPaused ? playImg : pauseImg, pauseX, pauseY, pauseSize, pauseSize);

  if (startButton) {
    ctx.drawImage(startImg, 0, 0, canvas.width, canvas.height);
    const btnX = (canvas.width - btnWidth) / 2;
    ctx.fillStyle = "#fff";
    ctx.fillRect(btnX, btnY, btnWidth, btnHeight);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(btnX, btnY, btnWidth, btnHeight);
    ctx.fillStyle = "#000";
    ctx.font = "bold 30px Italic";
    ctx.textAlign = "center";
    ctx.fillText("Start", canvas.width / 2, btnY + 40);
  }

  if (gameOver) {
    ctx.drawImage(gameOverImg, 0, 0, canvas.width, canvas.height);
    const btnX = (canvas.width - btnWidth) / 2;
    ctx.fillStyle = "#fff";
    ctx.fillRect(btnX, 130, btnWidth, btnHeight);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(btnX, 130, btnWidth, btnHeight);
    ctx.fillStyle = "#000";
    ctx.font = "bold 30px Italic";
    ctx.textAlign = "center";
    ctx.fillText("Start", canvas.width / 2, 170);
    ctx.fillStyle = "black";
    ctx.font = "bold 40px Italic";
    ctx.fillText(score, canvas.width / 2, 280);
  }

  if (!startButton && !gameOver) {
    drawTouchControls();
  }
}

function update() {
  velocityY += gravity;
  pandaY += velocityY;
  pandaX += velocityX;

  if (pandaX > canvas.width) pandaX = -pandaWidth;
  if (pandaX + pandaWidth < 0) pandaX = canvas.width;

  const scrollThreshold = canvas.height / 3;
  if (gameStarted && pandaY < scrollThreshold) {
    const delta = scrollThreshold - pandaY;
    pandaY = scrollThreshold;
    backgroundY += delta;
    maxHeight = Math.max(maxHeight, backgroundY);
  }

  if (pandaY > canvas.height) {
    gameOver = true;
    cancelAnimationFrame(animation);
  }

  for (const p of platforms) {
    const pandaBottom = pandaY + pandaHeight;
    const platTop = p.y + backgroundY;
    if (
      pandaX + pandaWidth > p.x &&
      pandaX < p.x + platformWidth &&
      pandaBottom >= platTop &&
      pandaBottom <= platTop + 10 &&
      velocityY > 0
    ) {
      pandaY = platTop - pandaHeight;
      velocityY = jumpPower;
      gameStarted = true;
    }
  }

  if (!gameStarted) {
    const groundY = platforms[0].y - 150;
    if (pandaY >= groundY) {
      pandaY = groundY;
      jump();
    }
  }

  platforms = platforms.filter(p => p.y + backgroundY < canvas.height + 50);
  while (platforms.length < 30) {
    const minY = Math.min(...platforms.map(p => p.y));
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: minY - stepY,
    });
  }
}

function resetGame() {
  backgroundY = 0;
  velocityX = 0;
  velocityY = 0;
  maxHeight = 0;
  gameStarted = false;
  startButton = true;
  gameOver = false;
  startLoop = false;
  generatePlatforms();
  pandaX = (canvas.width - pandaWidth) / 2;
  pandaY = platforms[0].y - pandaHeight;
  fourPlatforms = canvas.height - pandaY;
  draw();
}

function loop() {
  animation = requestAnimationFrame(loop);
  if (!isPaused && !startButton) {
    update();
  }
  draw();
}

function setupControls() {
  let keyLeft = false;
  let keyRight = false;

  // Клавиатура — удержание
  document.addEventListener("keydown", e => {
    if (e.code === "ArrowLeft") keyLeft = true;
    if (e.code === "ArrowRight") keyRight = true;
    if (e.code === "Space") jump();
  });

  document.addEventListener("keyup", e => {
    if (e.code === "ArrowLeft") keyLeft = false;
    if (e.code === "ArrowRight") keyRight = false;
  });

  // Сенсорный ввод — удержание
  canvas.addEventListener("touchstart", e => {
    const x = e.touches[0].clientX;
    if (x < window.innerWidth / 2) keyLeft = true;
    else keyRight = true;
  });

  canvas.addEventListener("touchend", () => {
    keyLeft = false;
    keyRight = false;
  });

  // Гироскоп
  window.addEventListener("deviceorientation", e => {
    const tilt = e.gamma;
    if (Math.abs(tilt) > 5) {
      velocityX = tilt > 0 ? 4 : -4;
    } else {
      velocityX = 0;
    }
  });

  // Обновляем движение постоянно (приоритет у наклона)
  setInterval(() => {
    // Только если гироскоп не активен
    if (!window.orientationActive) {
      if (keyLeft && !keyRight) velocityX = -5;
      else if (keyRight && !keyLeft) velocityX = 5;
      else velocityX = 0;
    }
  }, 20);

  // Клик по canvas (start/pause)
  canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const btnX = (canvas.width - btnWidth) / 2;

    // Пауза
    if (
      mouseX >= pauseX && mouseX <= pauseX + pauseSize &&
      mouseY >= pauseY && mouseY <= pauseY + pauseSize
    ) {
      isPaused = !isPaused;
      return;
    }

    // Старт
    if (startButton) {
      if (
        mouseX >= btnX && mouseX <= btnX + btnWidth &&
        mouseY >= btnY && mouseY <= btnY + btnHeight
      ) {
        startButton = false;
        if (!startLoop) {
          loop();
          startLoop = true;
        }
      }
    }

    // Game Over → restart
    if (gameOver) {
      if (
        mouseX >= btnX && mouseX <= btnX + btnWidth &&
        mouseY >= 130 && mouseY <= 130 + btnHeight
      ) {
        resetGame();
        gameOver = false;
        startButton = false;
        loop();
      }
    }
  });
}

window.onload = () => {
  resizeCanvas();
  generatePlatforms();
  pandaX = (canvas.width - pandaWidth) / 2;
  pandaY = platforms[0].y - pandaHeight;
  setupControls();
  draw();
};

window.addEventListener("resize", () => {
  const playing = !startButton && !gameOver;
  resizeCanvas();
  if (!playing) {
    generatePlatforms();
    pandaX = (canvas.width - pandaWidth) / 2;
    pandaY = platforms[0].y - pandaHeight;
    draw();
  }
});