const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const fonImg = new Image();
fonImg.src = "fonimg.jpg";

function resizeCanvas() {
  if (window.innerWidth <= 320) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  } else {
    canvas.width = 400;
    canvas.height = 600;
  }
}

function drawBackground() {
  if (fonImg.complete) {
    ctx.drawImage(fonImg, 0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = "#cceeff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function loop() {
  requestAnimationFrame(loop);
  drawBackground();
  // Здесь будет отрисовка игры (персонаж, платформы и т.п.)
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);
loop();