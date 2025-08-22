const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Session ID from Heroku Config Vars
const SESSION_ID = process.env.SESSION_ID || 'default-session';

console.log('🚀 Starting WhatsApp Bot...');
console.log('📱 Session ID:', SESSION_ID);

const client = new Client({
    authStrategy: new LocalAuth({
        clientId: SESSION_ID
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
            '--disable-gpu'
        ]
    }
});

// QR Code Generation
client.on('qr', (qr) => {
    console.log('📡 QR Code received! Scan with WhatsApp');
    qrcode.generate(qr, { small: true });
});

// Bot Ready
client.on('ready', () => {
    console.log('✅ Client is ready!');
    console.log('🤖 Bot is now online!');
});

// Message Handling
client.on('message', async message => {
    try {
        const content = message.body.toLowerCase();
        const sender = message.from;

        if (content === '.menu') {
            const menuText = `
🎵 *VOICE NOTE* 🎵

🤖 *BOT MENU* 🤖

📋 *Commands:*
🎧 .menu - Show menu
⚡ .ping - Speed test
🆔 .jid - Get chat ID
📤 .forward <jid> - Forward message

⭐ *Features:*
• 24/7 Online
• Fast Response
• Message Forwarding

🔧 *Made with:* whatsapp-web.js
            `;
            await client.sendMessage(sender, menuText);
        }
        else if (content === '.ping') {
            const start = Date.now();
            const replyMsg = await message.reply('🏓 Testing speed...');
            const end = Date.now();
            await replyMsg.edit(`🏓 Pong! Speed: ${end - start}ms`);
        }
        else if (content === '.jid') {
            await message.reply(`📱 Chat JID: ${sender}`);
        }
        else if (content.startsWith('.forward ')) {
            const jid = content.split(' ')[1];
            if (jid) {
                await message.forward(jid);
                await message.reply('✅ Message forwarded successfully!');
            } else {
                await message.reply('❌ Please provide JID: .forward <jid>');
            }
        }
    } catch (error) {
        console.log('❌ Message handling error:', error.message);
    }
});

// Initialize client
client.initialize().catch(error => {
    console.log('❌ Client initialization failed:', error.message);
});

// Heroku keep-alive
app.get('/', (req, res) => {
    res.send(`
        <h1>🤖 WhatsApp Bot is Running</h1>
        <p>Session ID: ${SESSION_ID}</p>
        <p>Use .menu in WhatsApp to see features</p>
    `);
});

app.listen(port, () => {
    console.log(`🌐 Server running on port ${port}`);
});
