const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Адаптация размера под экран
const mapSize = 10;
const screenWidth = window.innerWidth;
const tile = Math.floor(screenWidth / mapSize);
canvas.width = tile * mapSize;
canvas.height = tile * mapSize;

const map = [
 [1,1,1,1,1,1,1,1,1,1],
 [1,0,2,0,0,0,2,0,3,1],
 [1,0,1,1,0,1,1,0,0,1],
 [1,2,0,0,0,0,0,0,2,1],
 [1,0,1,1,0,1,1,0,0,1],
 [1,0,0,2,0,0,0,2,0,1],
 [1,0,1,1,0,1,1,0,0,1],
 [1,2,0,0,0,0,0,0,2,1],
 [1,0,0,1,1,1,0,0,0,1],
 [1,1,1,1,1,1,1,1,1,1],
];

let player = {x:1, y:1};
let coins = countCoins();

function countCoins() {
  let c = 0;
  for (const row of map) for (const v of row) if (v === 2) c++;
  return c;
}

function draw() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for (let y=0; y<map.length; y++) {
    for (let x=0; x<map[y].length; x++) {
      const v = map[y][x];
      if (v === 1) {
        ctx.fillStyle = '#5b3a29'; // Стены
        ctx.fillRect(x*tile, y*tile, tile, tile);
      } else {
        ctx.fillStyle = '#3a8f3d'; // Пол
        ctx.fillRect(x*tile, y*tile, tile, tile);
      }
      if (v === 2) {
        ctx.fillStyle = 'gold'; // Монетки
        ctx.beginPath();
        ctx.arc(x*tile + tile/2, y*tile + tile/2, tile/4, 0, Math.PI*2);
        ctx.fill();
      }
      if (v === 3) {
        ctx.fillStyle = coins === 0 ? '#c98b42' : '#555'; // Дверь
        ctx.fillRect(x*tile + tile/4, y*tile + tile/8, tile/2, tile*0.75);
      }
    }
  }
  ctx.font = `${tile * 0.7}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText('🦊', player.x * tile + tile/2, player.y * tile + tile/2);
}

function move(dx, dy) {
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (ny < 0 || ny >= map.length || nx < 0 || nx >= map[0].length) return;
  if (map[ny][nx] === 1) return;

  player.x = nx; player.y = ny;

  if (map[ny][nx] === 2) {
    map[ny][nx] = 0;
    coins--;
  }

  if (map[ny][nx] === 3 && coins === 0) {
    tg.showAlert('❤️ Максим, ЛЮБЛЮ ТЕБЯ! ❤️', () => {
        tg.close();
    });
  }
  draw();
}

// УПРАВЛЕНИЕ ТАПАМИ (нажатие на края экрана)
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Запрещаем прокрутку страницы при игре
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    // Центр текущего положения лисы
    const centerX = player.x * tile + tile/2;
    const centerY = player.y * tile + tile/2;

    const diffX = x - centerX;
    const diffY = y - centerY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
        move(diffX > 0 ? 1 : -1, 0); // Движение по горизонтали
    } else {
        move(0, diffY > 0 ? 1 : -1); // Движение по вертикали
    }
}, {passive: false});

// Клавиатура (для теста с ПК)
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') move(0,-1);
  if (e.key === 'ArrowDown') move(0,1);
  if (e.key === 'ArrowLeft') move(-1,0);
  if (e.key === 'ArrowRight') move(1,0);
});

draw();

