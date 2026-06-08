# Mr CRM powered by Downlabs

> **Boost WhatsApp Web with a powerful CRM and AI Auto-Reply automation.**

Mr CRM is a sophisticated browser extension designed for WhatsApp Web, integrating advanced CRM features with real-time AI automation. It allows businesses and individuals to automate message responses (including voice and images), manage customer pipelines, track inventory, and handle sales—all directly within the WhatsApp interface.

---

## 🚀 Key Features

### 🤖 AI Auto-Reply & Automation
- **Real-time Monitoring:** Intercepts incoming messages instantly using IndexedDB hooks.
- **Voice Message Transcription (STT):** Automatically decrypts and transcribes WhatsApp voice notes in real-time.
- **Intelligent AI Replies:** Generates context-aware responses using LLMs (GPT/Groq).
- **Multi-Media Support:** Handles text, voice messages (`ptt`), and images.
- **Quoted Replies:** Automatically quotes the original message when replying for better context.

### 💼 CRM & Business Tools
- **Customer Management:** Track customer statuses, contact details, and interaction history.
- **Sales & Inventory:** Manage products, stock movements, and POS (Point of Sale) directly.
- **Financial Tracking:** Handle payments, invoices, and promo codes.
- **Loyalty Programs:** Integrated loyalty and reward tracking.
- **Calendar & Planning:** Built-in calendar for scheduling and appointments.

### 🖥️ Seamless Integration
- **Website Bridge:** Seamless integration between your CRM and external websites.
- **Sidebar Interface:** A dedicated sidebar within WhatsApp Web for easy access to CRM tools.
- **Admin Dashboard:** A PHP-based backend dashboard for monitoring usage, users, and system health.

---

## 🛠️ Technology Stack

- **Frontend:** React, JavaScript (ES6+), CSS3/SCSS.
- **Extension:** WebExtensions API (Manifest V3), Content Scripts, Background Service Workers.
- **Backend:** PHP 8.1+, Supabase (Database & Auth), JWT for secure communication.
- **AI/ML:** 
  - **Models:** Groq (`openai/gpt-oss-20b`), OpenAI.
  - **Speech-to-Text:** Whisper (`whisper-large-v3-turbo`).
- **Database:** Supabase (PostgreSQL with Realtime capabilities).

---

## 📂 Project Structure

```text
├── assets/             # Extension styles and fonts
├── backend-php/        # Core PHP API and Supabase migrations
├── chunks/             # Compiled JS assets for the extension
├── crm/                # React-based CRM Dashboard
├── icons/              # Extension icons
├── background.js       # Background service worker (Media processing, API proxy)
├── content.js          # Core injection and WhatsApp DOM manipulation
├── idb-interceptor.js  # Real-time message interceptor (IndexedDB hooks)
├── manifest.json       # Extension configuration (MV3)
└── popup.html/js       # Extension UI popup
```

---

## ⚙️ Installation & Setup

### 1. Browser Extension
1. Open Chrome/Edge and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top right).
3. Click **Load unpacked** and select the root folder of this project.
4. The "Mr CRM" icon should now appear in your toolbar.

### 2. Backend (PHP)
The backend is designed for easy deployment on cPanel or any PHP-ready server.
1. Upload the `backend-php` folder to your server.
2. Point your domain/subdomain document root to `backend-php/public`.
3. Rename `.env.example` to `.env` and configure your:
   - Supabase Credentials
   - Groq/OpenAI API Keys
   - JWT Secret
4. Run the SQL migrations found in `backend-php/migrations/` in your Supabase SQL Editor.

---

## 🧠 Technical Deep Dive: Real-time Audio AI
The extension uses a unique "IndexedDB Interceptor" strategy to bypass polling:
1. **Intercept:** Hooks `IDBObjectStore.put/add` to catch messages the moment they arrive.
2. **Decrypt:** Sends encrypted media paths to the background worker.
3. **Transcribe:** Uses Whisper via Groq for low-latency speech-to-text.
4. **Respond:** Uses `wa-store-send-page.js` to inject responses back into the WhatsApp internal UI state.

---

## 📄 License & Credits
Developed by **[Downlabs](https://github.com/downlabs)**.
For support or customization, please contact the development team.

---
*Disclaimer: This project is for productivity and automation purposes. Ensure you comply with WhatsApp's Terms of Service when using automation tools.*
