// Импорт функций из Supabase-модуля
import { id, name, saveScore, loadLeaderboard, getUserRank } from './supabase.js';

// Получаем canvas и контекст рисования
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Загрузка изображений
const fonImg = new Image(); fonImg.src = "/img/fonimg.jpg";
const pandaImg = new Image(); pandaImg.src = "/img/Panda.png";
const pipeImg = new Image(); pipeImg.src = "/img/pipe.png";
const playImg = new Image(); playImg.src = "/img/play.png";
const pauseImg = new Image(); pauseImg.src = "/img/pause.png";
const startImg = new Image(); startImg.src = "/img/start.png";
const gameOverImg = new Image(); gameOverImg.src = "/img/gameOver.png";
const leaderImg = new Image(); leaderImg.src = "/img/leader.png";
const fonscoresImg = new Image(); fonscoresImg.src = "/img/fonscores.jpg";

// Константы для размеров, физики и кнопок
const platformWidth = 60, platformHeight = 20;
const pandaWidth = 60, pandaHeight = 70;
const stepY = 50, gravity = 0.5, jumpPower = -10;
const pauseX = 10, pauseY = 0, pauseSize = 50;
const btnWidth = 200, btnHeight = 60;

// Переменные состояния игры
let pandaX, pandaY;
let velocityX = 0, velocityY = 0;
let backgroundY = 0, maxHeight = 0, fourPlatforms = 0;
let gameStarted = false, isPaused = false, startButton = true;
let startLoop = false, gameOver = false, animation = null;
let btnY = 0, score = 0, playerRank = null;
let showLeader = false, leaderboardData = [];
let lastTime = performance.now();

let platforms = []; // Массив платформ

// Адаптивный размер канваса
function resizeCanvas() {
  if (window.innerWidth <= 320) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.width = "100vw";
    canvas.style.height = "100vh";
  } else {
    canvas.width = 400;
    canvas.height = 600;
    canvas.style.width = "400px";
    canvas.style.height = "600px";
  }
  btnY = canvas.height - 100;
}

// Генерация платформ
function generatePlatforms() {
  platforms = [];
  const startX = (canvas.width - platformWidth) / 2;
  const startY = canvas.height - 20;
  platforms.push({ x: startX, y: startY }); // первая платформа по центру

  for (let i = 1; i < 30; i++) {
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: startY - i * stepY,
    });
  }
}

// Прыжок панды
function jump() {
  velocityY = jumpPower;
}

// Кнопки для сенсорного управления
function drawTouchControls() {
  const size = 60, y = canvas.height - size - 10;
  ctx.fillStyle = "rgba(0,0,0,0.3)";

  // Левая кнопка
  ctx.beginPath();
  ctx.moveTo(20 + size, y);
  ctx.lineTo(20, y + size / 2);
  ctx.lineTo(20 + size, y + size);
  ctx.fill();

  // Правая кнопка
  ctx.beginPath();
  ctx.moveTo(canvas.width - 20 - size, y);
  ctx.lineTo(canvas.width - 20, y + size / 2);
  ctx.lineTo(canvas.width - 20 - size, y + size);
  ctx.fill();
}

// Основной рендеринг игры
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Прокрутка фона
  const bgHeight = (fonImg.height * canvas.width) / fonImg.width;
  const y = -backgroundY % bgHeight;
  for (let i = -1; i <= Math.ceil(canvas.height / bgHeight); i++) {
    ctx.drawImage(fonImg, 0, y + i * bgHeight, canvas.width, bgHeight);
  }

  // Платформы
  for (const p of platforms) {
    ctx.drawImage(pipeImg, p.x, p.y + backgroundY, platformWidth, platformHeight);
  }

  // Счёт
  score = Math.floor((maxHeight + fourPlatforms) / stepY);
  ctx.fillStyle = "black";
  ctx.font = "bold 28px Italic";
  ctx.fillText(score, canvas.width - 50, 35);

  // Панда и кнопка паузы
  ctx.drawImage(pandaImg, pandaX, pandaY, pandaWidth, pandaHeight);
  ctx.drawImage(isPaused ? playImg : pauseImg, pauseX, pauseY, pauseSize, pauseSize);

  // Стартовый экран или экран окончания
  if (startButton || gameOver) {
    const img = gameOver ? gameOverImg : startImg;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const btnX = (canvas.width - btnWidth) / 2;ctx.fillStyle = "#fff";
    ctx.fillRect(btnX, gameOver ? 130 : btnY, btnWidth, btnHeight);
    ctx.strokeStyle = "#000";
    ctx.strokeRect(btnX, gameOver ? 130 : btnY, btnWidth, btnHeight);
    ctx.fillStyle = "#000";
    ctx.font = "bold 30px Italic";
    ctx.textAlign = "center";
    ctx.fillText("Start", canvas.width / 2, (gameOver ? 130 : btnY) + 40);

    // Лидер и счёт при проигрыше
    if (gameOver) {
      ctx.drawImage(leaderImg, 5, 520, 40, 40);
      ctx.fillStyle = "black";
      ctx.font = "bold 40px Italic";
      ctx.fillText(score, canvas.width / 2, 280);

      if (playerRank !== null) {
        ctx.font = "bold 24px Italic";
      }
    } else {
      ctx.drawImage(leaderImg, 5, 520, 40, 40);
    }
  }

  // Отрисовка кнопок движения на мобилке
  if (!startButton && !gameOver) drawTouchControls();

  // Отображение топ-10
  if (showLeader) {
    ctx.drawImage(fonscoresImg, 20, 60, canvas.width - 40, canvas.height - 120);
    ctx.fillStyle = "black";
    ctx.font = "bold 25px Italic";
    ctx.textAlign = "left";
    leaderboardData.forEach((user, i) => {
      ctx.fillText(`${i + 1}. ${user.name} — ${user.score}`, 40, 150 + i * 35);
    });
  }
}

// Обновление физики и состояния игры
function update() {
  velocityY += gravity;
  pandaY += velocityY;
  pandaX += velocityX;

  // Переход за границы по X
  if (pandaX > canvas.width) pandaX = -pandaWidth;
  if (pandaX + pandaWidth < 0) pandaX = canvas.width;

  // Прокрутка вверх
  if (gameStarted && pandaY < canvas.height / 3) {
    const delta = canvas.height / 3 - pandaY;
    pandaY = canvas.height / 3;
    backgroundY += delta;
    maxHeight = Math.max(maxHeight, backgroundY);
  }

  // Проверка на проигрыш
  if (pandaY > canvas.height) {
    gameOver = true;
    cancelAnimationFrame(animation);
    score = Math.floor((maxHeight + fourPlatforms) / stepY);
    saveScore(score);
    getUserRank(score).then(rank => playerRank = rank);
  }

  // Столкновения с платформами
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

  // Автопрыжок на первой платформе до начала игры
  if (!gameStarted && platforms.length > 0) {
    const platY = platforms[0].y;
    if (pandaY + pandaHeight >= platY - 5 && velocityY >= 0) {
      velocityY = jumpPower;
      pandaY = platY - pandaHeight;
    }
  }

  // Удаление старых и добавление новых платформ
  platforms = platforms.filter(p => p.y + backgroundY < canvas.height + 50);
  while (platforms.length < 30) {
    const minY = Math.min(...platforms.map(p => p.y));
    platforms.push({
      x: Math.random() * (canvas.width - platformWidth),
      y: minY - stepY,
    });
  }
}

// Сброс игры
function resetGame() {
  backgroundY = maxHeight = velocityX = velocityY = 0;
  gameStarted = isPaused = showLeader = false;
  startButton = true;
  gameOver = false;

  generatePlatforms();
  pandaX = (canvas.width - pandaWidth) / 2;
  pandaY = platforms[0].y - pandaHeight;
  fourPlatforms = canvas.height - pandaY;
  draw();
}

// Игровой цикл
function loop(time) {
  const deltaTime = (time - lastTime) / 16.67;
  lastTime = time;

  animation = requestAnimationFrame(loop);
  if (!isPaused && !startButton) update(deltaTime);
  draw();
}

// Управление
function setupControls() {
  let keyLeft = false, keyRight = false;

  // Клавиатура
  document.addEventListener("keydown", e => {
    if (e.code === "ArrowLeft") keyLeft = true;
    if (e.code === "ArrowRight") keyRight = true;
    if (e.code === "Space") jump();
  });
  document.addEventListener("keyup", e => {
    if (e.code === "ArrowLeft") keyLeft = false;
    if (e.code === "ArrowRight") keyRight = false;
  });// Сенсорное управление
  canvas.addEventListener("touchstart", e => {
    const x = e.touches[0].clientX;
    keyLeft = x < window.innerWidth / 2;
    keyRight = !keyLeft;
  });

  canvas.addEventListener("touchend", () => {
    keyLeft = false;
    keyRight = false;
  });

  // Автообновление движения
  setInterval(() => {
    velocityX = keyLeft ? -4 : keyRight ? 4 : 0;
  }, 20);

  // Обработка кликов
  canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const btnX = (canvas.width - btnWidth) / 2;

    // Иконка лидеров (в левом нижнем углу) — показываем только если старт или game over
    if ((startButton || gameOver) && mouseX >= 5 && mouseX <= 45 && mouseY >= 520 && mouseY <= 560) {
      showLeader = !showLeader;
      if (showLeader) {
        loadLeaderboard().then(data => {
          leaderboardData = data;
          console.log('Leaderboard loaded:', leaderboardData);
          draw();
        });
      } else {
        draw();
      }
      return;
    }

    // Пауза
    if (mouseX >= pauseX && mouseX <= pauseX + pauseSize && mouseY >= pauseY && mouseY <= pauseY + pauseSize) {
      isPaused = !isPaused;
      return;
    }

    // Старт игры
    if (startButton && mouseX >= btnX && mouseX <= btnX + btnWidth && mouseY >= btnY && mouseY <= btnY + btnHeight) {
      startButton = false;
      if (!startLoop) {
        loop();
        startLoop = true;
      }
      return;
    }

    // Перезапуск после проигрыша
    if (gameOver && mouseX >= btnX && mouseX <= btnX + btnWidth && mouseY >= 130 && mouseY <= 130 + btnHeight) {
      resetGame();
      startButton = false;
      loop();
      return;
    }
  });
}

// Инициализация при загрузке
window.onload = () => {
  resizeCanvas();
  generatePlatforms();
  pandaX = (canvas.width - pandaWidth) / 2;
  pandaY = platforms[0].y - pandaHeight;
  setupControls();
  draw();
};

// Изменение размера окна
window.addEventListener("resize", () => {
  resizeCanvas();
  if (startButton || gameOver) {
    generatePlatforms();
    pandaX = (canvas.width - pandaWidth) / 2;
    pandaY = platforms[0].y - pandaHeight;
    draw();
  }
});