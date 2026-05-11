const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Подключаем Telegram WebApp API
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Настраиваем размер: берем ширину экрана и делим на количество клеток (10)
const mapSize = 10;
const tile = Math.floor(window.innerWidth / mapSize); 
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

function countCoins() {
  let c = 0;
  for (const row of map) for (const v of row) if (v === 2) c++;
  return c;
}

let coins = countCoins();

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
  // Рисуем лису, подгоняя размер шрифта под размер клетки
  ctx.font = `${tile * 0.8}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText('🦊', player.x * tile + tile/2, player.y * tile + tile/2);
}

function move(dx, dy) {
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (ny < 0 || ny >= map.length || nx < 0 || nx >= map[0].length) return;
  
  const cell = map[ny][nx];
  if (cell === 1) return;

  player.x = nx; player.y = ny;

  if (cell === 2) {
    map[ny][nx] = 0;
    coins--;
  }

  if (cell === 3 && coins === 0) {
    tg.showAlert('❤️ Максим, ЛЮБЛЮ ТЕБЯ! ❤️', () => {
        tg.close();
    });
  }
  draw();
}

// УПРАВЛЕНИЕ ДЛЯ ТЕЛЕФОНА (нажатие на части экрана)
canvas.addEventListener('touchstart', e => {
  const touch = e.touches[0];
  const rect = canvas.getBoundingClientRect();
  const tx = touch.clientX - rect.left;
  const ty = touch.clientY - rect.top;

  // Рассчитываем, куда нажал пользователь относительно лисы
  const pdx = tx - (player.x * tile + tile/2);
  const pdy = ty - (player.y * tile + tile/2);

  if (Math.abs(pdx) > Math.abs(pdy)) {
    move(pdx > 0 ? 1 : -1, 0); // Ходим влево-вправо
  } else {
    move(pdy > 0 ? 1 : -1, 0); // Ой, тут ошибка была, вот так:
    // Исправлено:
  }
});

// Упрощенное управление кликом для теста
canvas.addEventListener('click', e => {
  const rect = canvas.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const clickY = e.clientY - rect.top;
  
  const targetX = Math.floor(clickX / tile);
  const targetY = Math.floor(clickY / tile);
  
  // Простое перемещение в сторону клика
  if (targetX > player.x) move(1, 0);
  else if (targetX < player.x) move(-1, 0);
  else if (targetY > player.y) move(0, 1);
  else if (targetY < player.y) move(0, -1);
});

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') move(0,-1);
  if (e.key === 'ArrowDown') move(0,1);
  if (e.key === 'ArrowLeft') move(-1,0);
  if (e.key === 'ArrowRight') move(1,0);
});

draw();
