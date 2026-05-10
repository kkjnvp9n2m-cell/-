const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const tile = 64;

// Подключаем Telegram WebApp API
const tg = window.Telegram.WebApp;
tg.ready(); // Сообщаем Telegram, что приложение готово
tg.expand(); // Разворачиваем на весь экран

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
        ctx.arc(x*tile+32, y*tile+32, 12, 0, Math.PI*2);
        ctx.fill();
      }
      if (v === 3) {
        ctx.fillStyle = coins === 0 ? '#c98b42' : '#555'; // Дверь
        ctx.fillRect(x*tile+16, y*tile+8, 32, 48);
      }
    }
  }
  ctx.font = '40px serif';
  ctx.fillText('🦊', player.x*tile+10, player.y*tile+48);
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
    // Вместо alert используем интерфейс Telegram
    tg.showAlert('❤️ Максим, ЛЮБЛЮ ТЕБЯ! ❤️', () => {
        tg.close(); // Закрыть приложение после нажатия ОК
    });
  }
  draw();
}

// Управление кнопками на экране или клавиатурой
document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') move(0,-1);
  if (e.key === 'ArrowDown') move(0,1);
  if (e.key === 'ArrowLeft') move(-1,0);
  if (e.key === 'ArrowRight') move(1,0);
});

draw();
