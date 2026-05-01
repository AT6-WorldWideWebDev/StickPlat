const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Constants
const GRAVITY = 0.6;
const MOVE_SPEED = 2.5;
const JUMP_STRENGTH = 11;
const STICKFIGURE_COLOR = '#09f';
const GROUND_Y = 290;
const PLATFORM_COLOR = '#ccc';

// Level platforms (x, y, width, height)
const platforms = [
  {x: 0, y: GROUND_Y, w: 640, h: 40},     // Ground
  {x: 80, y: 210, w: 100, h: 15},
  {x: 260, y: 150, w: 120, h: 15},
  {x: 450, y: 90, w: 90, h: 15}
];

// Player state
let player = {
  x: 60,
  y: GROUND_Y - 40,
  w: 18,
  h: 44,
  vx: 0,
  vy: 0,
  onGround: false
};

// Input state
let keys = {};
window.addEventListener('keydown', e => { keys[e.code] = true; });
window.addEventListener('keyup', e => { keys[e.code] = false; });

// Main game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

// Game update logic
function update() {
  // Horizontal movement
  let move = 0;
  if (keys['ArrowLeft'] || keys['KeyA']) move -= 1;
  if (keys['ArrowRight'] || keys['KeyD']) move += 1;
  player.vx = move * MOVE_SPEED;

  // Jumping
  if ((keys['ArrowUp'] || keys['KeyW'] || keys['Space']) && player.onGround) {
    player.vy = -JUMP_STRENGTH;
    player.onGround = false;
  }

  // Apply gravity
  player.vy += GRAVITY;

  // Move on X
  player.x += player.vx;

  // Collision X
  for (const p of platforms) {
    if (
      player.x + player.w > p.x &&
      player.x < p.x + p.w &&
      player.y + player.h > p.y &&
      player.y < p.y + p.h
    ) {
      // Moving right
      if (player.vx > 0) {
        player.x = p.x - player.w;
      }
      // Moving left
      else if (player.vx < 0) {
        player.x = p.x + p.w;
      }
    }
  }

  // Move on Y
  player.y += player.vy;

  // Collision Y (simple implementation)
  player.onGround = false;
  for (const p of platforms) {
    if (
      player.x + player.w > p.x &&
      player.x < p.x + p.w &&
      player.y + player.h > p.y &&
      player.y + player.h - player.vy <= p.y // only falling onto
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  // Keep player on screen
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
  if (player.y > canvas.height) {
    // Respawn at start
    player.x = 60;
    player.y = GROUND_Y - 40;
    player.vy = 0;
  }
}

// Draw everything
function draw() {
  // CRT background
  ctx.fillStyle = '#181618';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Platforms
  for (const p of platforms) {
    ctx.fillStyle = PLATFORM_COLOR;
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }

  // Draw stickfigure
  drawStickfigure(player.x + player.w/2, player.y + player.h);

  // Title
  ctx.font = 'bold 32px monospace';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#24d9e6';
  ctx.shadowBlur = 8;
  ctx.fillText('CRT Platformer', 18, 46);
  ctx.shadowBlur = 0;
}

function drawStickfigure(cx, cy) {
  // Body proportions
  const headR = 8;
  const torso = 16;
  const leg = 14;
  const arm = 12;

  ctx.save();
  ctx.strokeStyle = STICKFIGURE_COLOR;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // Head
  ctx.beginPath();
  ctx.arc(cx, cy - torso - headR, headR, 0, Math.PI*2);
  ctx.stroke();

  // Body (torso)
  ctx.beginPath();
  ctx.moveTo(cx, cy - torso);
  ctx.lineTo(cx, cy - 4);
  ctx.stroke();

  // Arms
  ctx.beginPath();
  ctx.moveTo(cx, cy - torso + 5);
  ctx.lineTo(cx - arm, cy - torso + 10);
  ctx.moveTo(cx, cy - torso + 5);
  ctx.lineTo(cx + arm, cy - torso + 10);
  ctx.stroke();

  // Legs
  ctx.beginPath();
  ctx.moveTo(cx, cy - 4);
  ctx.lineTo(cx - 8, cy + leg);
  ctx.moveTo(cx, cy - 4);
  ctx.lineTo(cx + 8, cy + leg);
  ctx.stroke();

  ctx.restore();
}

gameLoop();
