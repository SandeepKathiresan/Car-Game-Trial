// --- ASSETS ---
const carImgs = [
  'assets/car1.png', // Player car
  'assets/car2.png', // AI 1
  'assets/car3.png'  // AI 2
].map(src => { let img = new Image(); img.src = src; return img; });

// --- GAME CONSTANTS ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const miniMap = document.getElementById('mini-map');
const miniCtx = miniMap.getContext('2d');
const timerDisplay = document.getElementById('timer');
const checkpointDisplay = document.getElementById('checkpoint');
const gameOverDiv = document.getElementById('game-over');

const TRACK_WIDTH = 800;
const TRACK_HEIGHT = 600;
const CAR_WIDTH = 60;
const CAR_HEIGHT = 36;
const NUM_CARS = 3;
const CHECKPOINTS = [
  {x: 400, y: 100, r: 60},
  {x: 700, y: 300, r: 60},
  {x: 400, y: 500, r: 60},
  {x: 100, y: 300, r: 60}
];
const LAP_CHECKPOINTS = CHECKPOINTS.length;
const TIMER_START = 30; // seconds per checkpoint

// --- GAME STATE ---
let cars = [
  {x: 400, y: 550, angle: -Math.PI/2, speed: 0, img: carImgs[0], color: '#ff5252', ai: false, checkpoint: 0},
  {x: 420, y: 570, angle: -Math.PI/2, speed: 0, img: carImgs[1], color: '#40c4ff', ai: true, checkpoint: 0},
  {x: 380, y: 570, angle: -Math.PI/2, speed: 0, img: carImgs[2], color: '#ffd600', ai: true, checkpoint: 0}
];
let keys = {};
let timer = TIMER_START;
let checkpointIdx = 0;
let gameOver = false;
let lastTime = Date.now();

// --- INPUT ---
document.addEventListener('keydown', e => { keys[e.key] = true; });
document.addEventListener('keyup', e => { keys[e.key] = false; });

// --- GAME LOOP ---
function gameLoop() {
  let now = Date.now();
  let dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  if (!gameOver) update(dt);
  draw();
  requestAnimationFrame(gameLoop);
}

// --- UPDATE ---
function update(dt) {
  // Player controls
  let player = cars[0];
  if (keys['ArrowUp']) player.speed = Math.min(player.speed + 120*dt, 220);
  else player.speed = Math.max(player.speed - 100*dt, 0);
  if (keys['ArrowLeft']) player.angle -= 2.2 * dt * (player.speed/120);
  if (keys['ArrowRight']) player.angle += 2.2 * dt * (player.speed/120);
  // Move player
  player.x += Math.cos(player.angle) * player.speed * dt;
  player.y += Math.sin(player.angle) * player.speed * dt;
  // AI cars
  for (let i = 1; i < NUM_CARS; i++) {
    let car = cars[i];
    let cp = CHECKPOINTS[car.checkpoint];
    let dx = cp.x - car.x, dy = cp.y - car.y;
    let targetAngle = Math.atan2(dy, dx);
    let da = ((targetAngle - car.angle + Math.PI*3) % (Math.PI*2)) - Math.PI;
    car.angle += Math.max(-1.5*dt, Math.min(1.5*dt, da));
    car.speed = Math.min(car.speed + 100*dt, 180);
    car.x += Math.cos(car.angle) * car.speed * dt;
    car.y += Math.sin(car.angle) * car.speed * dt;
    // AI checkpoint
    if (Math.hypot(car.x - cp.x, car.y - cp.y) < cp.r) {
      car.checkpoint = (car.checkpoint + 1) % LAP_CHECKPOINTS;
    }
  }
  // Player checkpoint
  let cp = CHECKPOINTS[checkpointIdx];
  if (Math.hypot(player.x - cp.x, player.y - cp.y) < cp.r) {
    checkpointIdx = (checkpointIdx + 1) % LAP_CHECKPOINTS;
    timer = TIMER_START;
    checkpointDisplay.textContent = `Checkpoint: ${checkpointIdx+1}`;
  }
  // Timer
  timer -= dt;
  timerDisplay.textContent = `Timer: ${Math.ceil(timer)}`;
  if (timer <= 0) {
    gameOver = true;
    gameOverDiv.textContent = 'Time Up! You Lost!';
    gameOverDiv.style.display = 'flex';
  }
}

// --- DRAW ---
function draw() {
  // Draw grass background
  ctx.fillStyle = '#388e3c';
  ctx.fillRect(0, 0, TRACK_WIDTH, TRACK_HEIGHT);
  // Draw track (oval)
  ctx.save();
  ctx.translate(TRACK_WIDTH/2, TRACK_HEIGHT/2);
  ctx.beginPath();
  ctx.ellipse(0, 0, 320, 200, 0, 0, Math.PI*2);
  ctx.lineWidth = 60;
  ctx.strokeStyle = '#444'; // road
  ctx.stroke();
  // Curbs
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#fff';
  ctx.setLineDash([20, 20]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  // Start line (bottom)
  ctx.save();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(320, 570);
  ctx.lineTo(480, 570);
  ctx.stroke();
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#fff' : '#111';
    ctx.fillRect(320 + i*20, 570, 10, 20);
  }
  ctx.restore();

  // Finish line (top)
  ctx.save();
  ctx.strokeStyle = '#ffd600';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(340, 100);
  ctx.lineTo(460, 100);
  ctx.stroke();
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#ffd600' : '#111';
    ctx.fillRect(340 + i*20, 100, 10, 20);
  }
  ctx.restore();

  // Checkpoints
  for (let i = 0; i < CHECKPOINTS.length; i++) {
    let cp = CHECKPOINTS[i];
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, cp.r, 0, Math.PI*2);
    ctx.fillStyle = i === checkpointIdx ? '#fff' : '#ffd600';
    ctx.fill();
    ctx.restore();
  }
  // Cars (with 3D effects)
  for (let i = NUM_CARS-1; i >= 0; i--) {
    let car = cars[i];
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.angle);
    // Draw shadow
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.scale(1, 0.4);
    ctx.beginPath();
    ctx.ellipse(0, 40, CAR_WIDTH*0.45, CAR_HEIGHT*0.5, 0, 0, Math.PI*2);
    ctx.fillStyle = '#000';
    ctx.fill();
    ctx.restore();
    // Draw wheels (perspective)
    ctx.save();
    ctx.fillStyle = '#222';
    ctx.fillRect(-CAR_WIDTH/2+4, -CAR_HEIGHT/2+4, 8, CAR_HEIGHT-8); // left
    ctx.fillRect(CAR_WIDTH/2-12, -CAR_HEIGHT/2+4, 8, CAR_HEIGHT-8); // right
    ctx.restore();
    // Draw 3D car body (gradient)
    let grad = ctx.createLinearGradient(0, -CAR_HEIGHT/2, 0, CAR_HEIGHT/2);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.2, car.color);
    grad.addColorStop(0.8, car.color);
    grad.addColorStop(1, '#222');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-CAR_WIDTH/2+6, -CAR_HEIGHT/2);
    ctx.lineTo(CAR_WIDTH/2-6, -CAR_HEIGHT/2);
    ctx.bezierCurveTo(CAR_WIDTH/2, -CAR_HEIGHT/2+8, CAR_WIDTH/2, CAR_HEIGHT/2-8, CAR_WIDTH/2-6, CAR_HEIGHT/2);
    ctx.lineTo(-CAR_WIDTH/2+6, CAR_HEIGHT/2);
    ctx.bezierCurveTo(-CAR_WIDTH/2, CAR_HEIGHT/2-8, -CAR_WIDTH/2, -CAR_HEIGHT/2+8, -CAR_WIDTH/2+6, -CAR_HEIGHT/2);
    ctx.closePath();
    ctx.fill();
    // Cockpit (windshield)
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = '#b3e5fc';
    ctx.beginPath();
    ctx.ellipse(0, -CAR_HEIGHT/6, CAR_WIDTH/6, CAR_HEIGHT/6, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
    // Highlights
    ctx.save();
    ctx.globalAlpha = 0.18;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.ellipse(0, -CAR_HEIGHT/3, CAR_WIDTH/4, CAR_HEIGHT/10, 0, 0, Math.PI);
    ctx.fill();
    ctx.restore();
    // Front/rear details
    ctx.save();
    ctx.fillStyle = '#222';
    ctx.fillRect(-CAR_WIDTH/8, -CAR_HEIGHT/2, CAR_WIDTH/4, 6); // front
    ctx.fillStyle = '#ff1744';
    ctx.fillRect(-CAR_WIDTH/8, CAR_HEIGHT/2-6, CAR_WIDTH/4, 6); // rear
    ctx.restore();
    // Draw border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(-CAR_WIDTH/2, -CAR_HEIGHT/2, CAR_WIDTH, CAR_HEIGHT);
    // Optionally, draw car image on top if loaded
    if (car.img.complete && car.img.naturalWidth > 0) {
      ctx.globalAlpha = 0.7;
      ctx.drawImage(car.img, -CAR_WIDTH/2, -CAR_HEIGHT/2, CAR_WIDTH, CAR_HEIGHT);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  // Mini-map
  drawMiniMap();
}

function drawMiniMap() {
  miniCtx.clearRect(0,0,miniMap.width,miniMap.height);
  // Draw grass
  miniCtx.fillStyle = '#388e3c';
  miniCtx.fillRect(0, 0, miniMap.width, miniMap.height);
  // Draw oval track
  miniCtx.save();
  miniCtx.translate(miniMap.width/2, miniMap.height/2);
  miniCtx.beginPath();
  miniCtx.ellipse(0, 0, 56, 36, 0, 0, Math.PI*2);
  miniCtx.lineWidth = 12;
  miniCtx.strokeStyle = '#444';
  miniCtx.stroke();
  miniCtx.lineWidth = 2;
  miniCtx.strokeStyle = '#fff';
  miniCtx.setLineDash([6, 6]);
  miniCtx.stroke();
  miniCtx.setLineDash([]);
  miniCtx.restore();
  // Checkpoints
  for (let i = 0; i < CHECKPOINTS.length; i++) {
    let cp = CHECKPOINTS[i];
    miniCtx.beginPath();
    miniCtx.arc(cp.x/5.7, cp.y/4.3, 7, 0, Math.PI*2);
    miniCtx.fillStyle = i === checkpointIdx ? '#fff' : '#ffd600';
    miniCtx.globalAlpha = 0.7;
    miniCtx.fill();
  }
  // Cars
  for (let i = 0; i < NUM_CARS; i++) {
    let car = cars[i];
    miniCtx.beginPath();
    miniCtx.arc(car.x/5.7, car.y/4.3, 5, 0, Math.PI*2);
    miniCtx.fillStyle = car.color;
    miniCtx.globalAlpha = 1;
    miniCtx.fill();
  }
}

// --- RESET ---
function resetGame() {
  cars = [
    {x: 400, y: 550, angle: -Math.PI/2, speed: 0, img: carImgs[0], color: '#ff5252', ai: false, checkpoint: 0},
    {x: 420, y: 570, angle: -Math.PI/2, speed: 0, img: carImgs[1], color: '#40c4ff', ai: true, checkpoint: 0},
    {x: 380, y: 570, angle: -Math.PI/2, speed: 0, img: carImgs[2], color: '#ffd600', ai: true, checkpoint: 0}
  ];
  timer = TIMER_START;
  checkpointIdx = 0;
  gameOver = false;
  gameOverDiv.style.display = 'none';
  checkpointDisplay.textContent = `Checkpoint: 1`;
  timerDisplay.textContent = `Timer: ${TIMER_START}`;
}
gameOverDiv.addEventListener('click', resetGame);

// --- START ---
window.onload = () => {
  resetGame();
  lastTime = Date.now();
  gameLoop();
}; 