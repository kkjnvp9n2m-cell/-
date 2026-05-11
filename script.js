const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Авто-подбор размера, чтобы игра влезла (80% от ширины экрана)
const mapSize = 10;
const screenWidth = window.innerWidth * 0.85;
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
let coins = 0;

function updateCoins() {
    let count = 0;
    for (let y=0; y<map.length; y++) {
        for (let x=0; x<map[y].length; x++) {
            if (map[y][x] === 2) count++;
        }
    }
    coins = count;
}
updateCoins();

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y=0; y<map.length; y++) {
        for (let x=0; x<map[y].length; x++) {
            const v = map[y][x];
            // Пол
            ctx.fillStyle = '#3a8f3d';
            ctx.fillRect(x*tile, y*tile, tile, tile);
            
            if (v === 1) { // Стены
                ctx.fillStyle = '#5b3a29';
                ctx.fillRect(x*tile, y*tile, tile, tile);
            } else if (v === 2) { // Монетки
                ctx.fillStyle = 'gold';
                ctx.beginPath();
                ctx.arc(x*tile+tile/2, y*tile+tile/2, tile/4, 0, Math.PI*2);
                ctx.fill();
            } else if (v === 3) { // Дверь
                ctx.fillStyle = coins === 0 ? '#c98b42' : '#555';
                ctx.fillRect(x*tile+tile/4, y*tile+tile/8, tile/2, tile*0.75);
            }
        }
    }
    // Лиса
    ctx.font = `${tile * 0.7}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText('🦊', player.x*tile + tile/2, player.y*tile + tile/2);
}

window.move = function(dx, dy) {
    const nx = player.x + dx;
    const ny = player.y + dy;
    
    if (ny < 0 || ny >= map.length || nx < 0 || nx >= map[0].length) return;
    if (map[ny][nx] === 1) return;

    player.x = nx;
    player.y = ny;

    if (map[ny][nx] === 2) {
        map[ny][nx] = 0;
        updateCoins();
    }

    if (map[ny][nx] === 3 && coins === 0) {
        tg.showAlert('❤️ Максим, ЛЮБЛЮ ТЕБЯ! ❤️', () => {
            tg.close();
        });
    }
    draw();
};

draw();

