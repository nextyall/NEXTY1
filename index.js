const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Get session ID from Heroku Config Vars
const SESSION_ID = process.env.SESSION_ID;

if (!SESSION_ID) {
    console.error('❌ No SESSION_ID found! Paste your SESSION_ID from the generator site.');
    process.exit(1);
}

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
    },
    takeoverOnConflict: true,
    takeoverTimeoutMs: 60000,
    restartOnAuthFail: true
});

// QR Code (first-time only)
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
    const sender = message.from;
    const content = message.body.toLowerCase();

    try {
        if (content === '.menu') {
            await client.sendMessage(sender, `
⚡ *WhatsApp 2X Bot* ⚡
📋 Commands:
.menu - Show menu
.ping - Speed test
.jid - Get chat ID
.forward <jid> - Forward message
            `);
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
client.initialize().catch(err => console.error('❌ Client init failed:', err));

// Express server for health check
app.get('/', (req, res) => {
    res.send(`<h1>🤖 WhatsApp Bot Running</h1>
<p>📱 Session ID: ${SESSION_ID}</p>
<p>Use .menu in WhatsApp to see commands</p>`);
});

app.listen(port, () => {
    console.log(`🌐 Server running on port ${port}`);
});
