const { Client, RemoteAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

// Session stored in Heroku Config Vars as base64
const SESSION_VAR = process.env.SESSION_DATA || null;

console.log('🚀 Starting WhatsApp Bot on Heroku 2X Plan...');

let sessionData = null;
if (SESSION_VAR) {
    try {
        sessionData = JSON.parse(Buffer.from(SESSION_VAR, 'base64').toString('utf-8'));
        console.log('💾 Session loaded from environment variable');
    } catch (err) {
        console.error('❌ Failed to parse session data:', err.message);
    }
}

const client = new Client({
    authStrategy: new RemoteAuth({
        clientId: 'heroku-bot',
        session: sessionData,
        store: {
            async save(session) {
                // Encode session to base64 and log instructions for Heroku config
                const encoded = Buffer.from(JSON.stringify(session)).toString('base64');
                console.log('💾 Save this to Heroku Config Var SESSION_DATA:\n', encoded);
            },
            async get() {
                return sessionData;
            },
            async delete() {
                console.log('🗑 Session deleted');
            }
        }
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
            '--memory-pressure-level=high'
        ]
    },
    takeoverOnConflict: true,
    takeoverTimeoutMs: 60000,
    restartOnAuthFail: true
});

// QR Code
client.on('qr', (qr) => {
    console.log('📡 QR Code received! Scan with WhatsApp');
    qrcode.generate(qr, { small: true });
});

// Ready
client.on('ready', () => {
    console.log('✅ Client is ready!');
});

// Message Handling
client.on('message', async (message) => {
    try {
        const content = message.body.toLowerCase();
        const sender = message.from;

        if (content === '.menu') {
            const menuText = `
⚡ *2X POWER BOT* ⚡

📋 Commands:
🎧 .menu - Show menu
⚡ .ping - Speed test
🆔 .jid - Get chat ID
📤 .forward <jid> - Forward message

⭐ 2X Plan Features:
• 2X CPU - Faster Speed
• 1GB RAM - More Memory
• Never Sleeps - 24/7 Online
            `;
            await client.sendMessage(sender, menuText);
        } else if (content === '.ping') {
            const start = Date.now();
            const replyMsg = await message.reply('🏓 Testing speed...');
            const end = Date.now();
            await replyMsg.edit(`🏓 Pong! ${end - start}ms`);
        } else if (content === '.jid') {
            await message.reply(`📱 Chat JID: ${sender}`);
        } else if (content.startsWith('.forward ')) {
            const jid = content.split(' ')[1];
            if (jid) {
                await message.forward(jid);
                await message.reply('✅ Message forwarded successfully!');
            } else {
                await message.reply('❌ Please provide JID: .forward <jid>');
            }
        }
    } catch (err) {
        console.error('❌ Message error:', err.message);
    }
});

// Initialize client
(async () => {
    try {
        await client.initialize();
    } catch (err) {
        console.error('❌ Client initialization failed:', err.message);
        setTimeout(() => client.initialize(), 5000);
    }
})();

// Express routes
app.get('/', (req, res) => {
    res.send(`
        <h1>🤖 WhatsApp Bot Running</h1>
        <p>📱 Session Active: ${sessionData ? 'Yes' : 'No'}</p>
        <p>💪 2X Plan - 24/7 Online</p>
        <p>Use .menu in WhatsApp to see commands</p>
    `);
});

app.get('/health', (req, res) => {
    res.json({
        status: 'active',
        plan: '2x_basic',
        uptime: process.uptime(),
        session: !!sessionData
    });
});

app.listen(port, () => {
    console.log(`🌐 Server running on port ${port}`);
});
