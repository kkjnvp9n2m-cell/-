# game-got
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import zipfile, os, textwrap

base = Path('/mnt/data/maxim_telegram_game_bot')
assets = base / 'assets'
assets.mkdir(parents=True, exist_ok=True)

# Create simple heart image
img = Image.new('RGBA', (512, 512), (255, 255, 255, 255))
draw = ImageDraw.Draw(img)
# heart shape
draw.polygon([(256,420),(80,220),(80,130),(150,60),(256,120),(362,60),(432,130),(432,220)], fill=(220,0,0,255))
img.save(base / 'final_heart.png')

# bot.py
bot_py = '''
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes
import os

TOKEN = "8724070731:AAEI6Dk_dX-p2DdMgL2yrYEl99XhkkorZp4"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "🦊 Помоги лисе собрать все монеты и открыть дверь!\\n\\n"
        "Открой игру: https://YOUR-GAME-LINK"
    )

async def win(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_photo(
        photo=open("final_heart.png", "rb"),
        caption="❤️ Максим, ЛЮБЛЮ ТЕБЯ! ❤️"
    )

app = ApplicationBuilder().token(TOKEN).build()
app.add_handler(CommandHandler("start", start))
app.add_handler(CommandHandler("win", win))

if __name__ == "__main__":
    app.run_polling()
'''.strip()
(base / 'bot.py').write_text(bot_py, encoding='utf-8')

# game.html
game_html = '''
<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<title>Fox Maze</title>
<link rel="stylesheet" href="style.css">
</head>
<body>
<canvas id="game" width="640" height="640"></canvas>
<script src="script.js"></script>
</body>
</html>
'''.strip()
(base / 'game.html').write_text(game_html, encoding='utf-8')

style_css = '''
body { margin:0; background:#1f4d1f; display:flex; justify-content:center; align-items:center; height:100vh; }
canvas { border:4px solid #6b3e26; image-rendering: pixelated; background:#2f7d32; }
'''.strip()
(base / 'style.css').write_text(style_css, encoding='utf-8')

script_js = '''
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const tile = 64;

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
// 0 floor, 1 wall, 2 coin, 3 door

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
        ctx.fillStyle = '#5b3a29';
        ctx.fillRect(x*tile, y*tile, tile, tile);
      } else {
        ctx.fillStyle = '#3a8f3d';
        ctx.fillRect(x*tile, y*tile, tile, tile);
      }
      if (v === 2) {
        ctx.fillStyle = 'gold';
        ctx.beginPath();
        ctx.arc(x*tile+32, y*tile+32, 12, 0, Math.PI*2);
        ctx.fill();
      }
      if (v === 3) {
        ctx.fillStyle = coins === 0 ? '#c98b42' : '#555';
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
  const cell = map[ny][nx];
  if (cell === 1) return;

  player.x = nx; player.y = ny;

  if (cell === 2) {
    map[ny][nx] = 0;
    coins--;
  }

  if (cell === 3 && coins === 0) {
    alert('❤️ Максим, ЛЮБЛЮ ТЕБЯ! ❤️');
    if (window.Telegram && Telegram.WebApp) {
      Telegram.WebApp.sendData('WIN');
      Telegram.WebApp.close();
    }
  }

  draw();
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowUp') move(0,-1);
  if (e.key === 'ArrowDown') move(0,1);
  if (e.key === 'ArrowLeft') move(-1,0);
  if (e.key === 'ArrowRight') move(1,0);
});

draw();
'''.strip()
(base / 'script.js').write_text(script_js, encoding='utf-8')

(base / 'requirements.txt').write_text('python-telegram-bot==22.0\n', encoding='utf-8')

(base / 'README.txt').write_text(
    "1. Загрузите game.html, script.js и style.css на GitHub Pages.\n"
    "2. В bot.py вставьте токен бота.\n"
    "3. Замените https://YOUR-GAME-LINK на ссылку на game.html.\n"
    "4. Установите: pip install -r requirements.txt\n"
    "5. Запустите: python bot.py\n"
    "6. После победы в игре откроется сообщение 'Максим, ЛЮБЛЮ ТЕБЯ!'.\n",
    encoding='utf-8'
)

# zip
zip_path = Path('/mnt/data/maxim_telegram_game_bot.zip')
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as z:
    for p in base.rglob('*'):
        z.write(p, p.relative_to(base))

print(zip_path)