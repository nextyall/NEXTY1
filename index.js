const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Original SESSION_ID from Heroku Config Vars
let SESSION_ID = process.env.SESSION_ID;

if (!SESSION_ID) {
    console.error('❌ No SESSION_ID found! Paste your SESSION_ID from generator site.');
    process.exit(1);
}

// Create a valid clientId for LocalAuth
// Only allow letters, numbers, underscore (_) and hyphen (-)
let CLIENT_ID = SESSION_ID.replace(/[^a-zA-Z0-9_-]/g, '');

console.log('📱 Using original SESSION_ID:', SESSION_ID);
console.log('✅ Using valid CLIENT_ID for LocalAuth:', CLIENT_ID);

const client = new Client({
    authStrategy: new LocalAuth({ clientId: CLIENT_ID }),
    puppeteer: {
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
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

// QR Code for first-time authentication
client.on('qr', (qr) => {
    console.log('📡 QR Code received! Scan with WhatsApp');
    qrcode.generate(qr, { small: true });
});

// Bot ready
client.on('ready', () => {
    console.log('✅ Client is ready!');
});

// Message handling
client.on('message', async message => {
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
<p>📱 SESSION_ID: ${SESSION_ID}</p>
<p>Use .menu in WhatsApp to see commands</p>`);
});

app.listen(port, () => {
    console.log(`🌐 Server running on port ${port}`);
});
