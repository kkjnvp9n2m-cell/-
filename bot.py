from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, ContextTypes

# 1. ЗАМЕНИ ЭТО на свой токен
TOKEN = "8724070731:AAEI6Dk_dX-p2DdMgL2yrYEl99XhkkorZp4"

# 2. ЗАМЕНИ ЭТО на реальную ссылку (например, https://твой-логин.github.io/game.html)
GAME_URL = "https://ВАША_ССЫЛКА_ТУТ"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Создаем кнопку, которая открывает Mini App
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("Играть 🦊", web_app=WebAppInfo(url=GAME_URL))]
    ])
    
    await update.message.reply_text(
        "🦊 Помоги лисе собрать все монеты и открыть дверь!",
        reply_markup=keyboard
    )

if __name__ == "__main__":
    # Создаем приложение
    app = ApplicationBuilder().token(TOKEN).build()
    
    # Добавляем команду /start
    app.add_handler(CommandHandler("start", start))
    
    print("Бот запущен... Нажми Ctrl+C для остановки")
    app.run_polling()
