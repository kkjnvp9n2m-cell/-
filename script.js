const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const tg = window.Telegram.WebApp;
tg.ready();
tg.expand();

// Настройки поля
const mapSize = 12; 
const screenWidth = window.innerWidth * 0.9;
const tile = Math.floor(screenWidth / mapSize);
canvas.width = tile * mapSize;
canvas.height = tile * mapSize;

let map = [];
let player = {x: 1, y: 1};
let coins = 0;

function generateLevel() {
    // 1. Сначала делаем всё поле пустым (травой)
    map = [];
    for (let y = 0; y < mapSize; y++) {
        map[y] = [];
        for (let x = 0; x < mapSize; x++) {
            // Края — стены, внутри — трава
            if (x === 0 || y === 0 || x === mapSize - 1 || y === mapSize - 1) {
                map[y][x] = 1;
            } else {
                map[y][x] = 0;
            }
        }
    }

    // 2. Ставим выход (дверь) в правый нижний угол
    map[mapSize - 2][mapSize - 2] = 3;

    // 3. Добавляем случайные стены, но только если они не перекрывают путь
    // Мы ставим стены "островками", чтобы всегда можно было обойти
    for (let i = 0; i < 25; i++) {
        let rx = Math.floor(Math.random() * (mapSize - 2)) + 1;
        let ry = Math.floor(Math.random() * (mapSize - 2)) + 1;
        
        // Не ставим стену на игрока, на выход и рядом с ними для старта
        if ((rx === 1 && ry === 1) || (rx === mapSize - 2 && ry === mapSize - 2)) continue;
        if (rx === 1 && ry === 2) continue; 
        if (rx === 2 && ry === 1) continue;

        map[ry][rx] = 1;
    }

    // 4. Расставляем монеты (7 штук) только на пустые клетки
    let coinsPlaced = 0;
    while (coinsPlaced < 7) {
        let rx = Math.floor(Math.random() * (mapSize - 2)) + 1;
        let ry = Math.floor(Math.random() * (mapSize - 2)) + 1;
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
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            if (map[y][x] === 2) coins++;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < mapSize; y++) {
        for (let x = 0; x < mapSize; x++) {
            const v = map[y][x];
            // Рисуем пол (траву)
            ctx.fillStyle = '#3a8f3d';
            ctx.fillRect(x * tile, y * tile, tile, tile);
            
            if (v === 1) { // Стены (деревья/камни)
                ctx.fillStyle = '#5b3a29';
                ctx.fillRect(x * tile, y * tile, tile, tile);
                // Рисуем небольшую "текстуру" на стене
                ctx.fillStyle = '#4a2e21';
                ctx.fillRect(x * tile + 5, y * tile + 5, tile - 10, tile - 10);
            } else if (v === 2) { // Монетки
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(x * tile + tile / 2, y * tile + tile / 2, tile / 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = '#B8860B';
                ctx.stroke();
            } else if (v === 3) { // Дверь
                ctx.fillStyle = coins === 0 ? '#ffcc00' : '#444';
                ctx.fillRect(x * tile + tile / 4, y * tile + tile / 8, tile / 2, tile * 0.75);
            }
        }
    }
    // Рисуем лису
    ctx.font = `${tile * 0.8}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText('🦊', player.x * tile + tile / 2, player.y * tile + tile / 2);
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
