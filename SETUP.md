# 🛠 Tip Splitter — Setup Guide (5 minutes)

This guide shows how to customize the app for yourself.
No coding skills required.

---

## 1️⃣ Change Telegram username (VERY IMPORTANT)

Open file:
config.js

Find this line:
SELLER_USERNAME: "xarm0",

Replace xarm0 with YOUR username (without @).

Example:
SELLER_USERNAME: "johnsmith",

Save file.

---

## 2️⃣ Change PRO price text

In config.js find:
PRO_PRICE_TEXT: "$2",

Change to any text you want.
Examples:
"$3"
"$5"
"2 USD"

---

## 3️⃣ Change promo codes

In config.js find:
PROMO_CODES: [ ... ]

You can:
- Add new codes
- Remove used codes
- Rename codes

Example:
"MYPRO-001",
"MYPRO-002",

Tip:
Keep a list of sold codes in a spreadsheet.

---

## 4️⃣ Change app name

Open file:
index.html

Find:
Tip Splitter

Replace with your app name.
Example:
My Tip App

---

## 5️⃣ Publish website (GitHub Pages)

1. Open repository Settings
2. Go to Pages
3. Source:
   - Branch: main
   - Folder: /(root)
4. Save

You will get a link like:
https://yourname.github.io/repo-name/

---

## 6️⃣ Connect to Telegram

1. Open @BotFather
2. Create a bot
3. Set Main App URL to your GitHub Pages link
4. Set domain (without https)

---

## ✅ Done

Your Telegram Mini App is ready.
Users can open it, buy PRO via promo code, and use it without servers.

---

If you are stuck:
Check README.md
