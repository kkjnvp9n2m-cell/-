const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Увеличили поле до 12 клеток
const mapSize = 12; 
const screenWidth = window.innerWidth * 0.92;
const tile = Math.floor(screenWidth / mapSize);
canvas.width = tile * mapSize;
canvas.height = tile * mapSize;

let map = [];
let player = {x: 1, y: 1};
let coins = 0;

// Функция генерации случайного лабиринта
function generateLevel() {
    map = [];
    // 1. Заполняем всё стенами
    for (let y = 0; y < mapSize; y++) {
        map[y] = [];
        for (let x = 0; x < mapSize; x++) {
            map[y][x] = 1; 
        }
    }

    // 2. Создаем случайные дорожки (алгоритм случайного блуждания)
    let curX = 1, curY = 1;
    map[curY][curX] = 0;
    
    for (let i = 0; i < 150; i++) {
        let dir = Math.floor(Math.random() * 4);
        if (dir === 0 && curY > 1) curY--;
        else if (dir === 1 && curY < mapSize - 2) curY++;
        else if (dir === 2 && curX > 1) curX--;
        else if (dir === 3 && curX < mapSize - 2) curX++;
        map[curY][curX] = 0;
    }

    // 3. Ставим выход (дверь) в случайном пустом месте снизу
    map[mapSize-2][mapSize-2] = 3; 
    map[mapSize-2][mapSize-3] = 0; // Проход к двери

    // 4. Расставляем монеты (2) в случайные пустые места
    let coinsPlaced = 0;
    while (coinsPlaced < 7) {
        let rx = Math.floor(Math.random() * (mapSize-2)) + 1;
        let ry = Math.floor(Math.random() * (mapSize-2)) + 1;
        if (map[ry][rx] === 0 && (rx !== 1 || ry !== 1)) {
            map[ry][rx] = 2;
            coinsPlaced++;
        }
    }
    
    player = {x: 1, y: 1};
    countCoins();
}

function countCoins() {
    coins = 0;
    for (let y=0; y<mapSize; y++) {
        for (let x=0; x<mapSize; x++) {
            if (map[y][x] === 2) coins++;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y=0; y<mapSize; y++) {
        for (let x=0; x<mapSize; x++) {
            const v = map[y][x];
            ctx.fillStyle = '#3a8f3d'; // Трава
            ctx.fillRect(x*tile, y*tile, tile, tile);
            
            if (v === 1) {
                ctx.fillStyle = '#5b3a29'; // Стены
                ctx.fillRect(x*tile, y*tile, tile, tile);
            } else if (v === 2) {
                ctx.fillStyle = 'gold';
                ctx.beginPath();
                ctx.arc(x*tile+tile/2, y*tile+tile/2, tile/4, 0, Math.PI*2);
                ctx.fill();
            } else if (v === 3) {
                ctx.fillStyle = coins === 0 ? '#ffcc00' : '#444';
                ctx.fillRect(x*tile+tile/4, y*tile+tile/8, tile/2, tile*0.75);
            }
        }
    }
    ctx.font = `${tile * 0.8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText('🦊', player.x*tile + tile/2, player.y*tile + tile/2);
}

window.move = function(dx, dy) {
    const nx = player.x + dx;
    const ny = player.y + dy;
    if (ny < 0 || ny >= mapSize || nx < 0 || nx >= mapSize) return;
    if (map[ny][nx] === 1) return;

    player.x = nx;
    player.y = ny;

    if (map[ny][nx] === 2) {
        map[ny][nx] = 0;
        countCoins();
    }

    if (map[ny][nx] === 3 && coins === 0) {
        tg.showAlert('❤️ Максим, ЛЮБЛЮ ТЕБЯ! ❤️', () => {
            tg.close();
        });
    }
    draw();
};

generateLevel();
draw();


