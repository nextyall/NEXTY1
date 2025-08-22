const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Get SESSION_ID from environment
let SESSION_ID = process.env.SESSION_ID;

if (!SESSION_ID) {
    console.error('❌ No SESSION_ID provided in Heroku Config Vars.');
    process.exit(1);
}

// Clean clientId for LocalAuth (only alphanumeric, _ and -)
let CLIENT_ID = SESSION_ID.replace(/[^a-zA-Z0-9_-]/g, '');
console.log('📱 Using SESSION_ID:', SESSION_ID);
console.log('✅ Using safe CLIENT_ID:', CLIENT_ID);

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

// QR code event (if needed)
client.on('qr', (qr) => {
    console.log('📡 Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

// Ready
client.on('ready', () => {
    console.log('✅ WhatsApp Bot is ready!');
});

// Message handler
client.on('message', async message => {
    const sender = message.from;
    const content = message.body.toLowerCase();

    try {
        if (content === '.menu') {
            await client.sendMessage(sender, `
⚡ *WhatsApp Bot* ⚡
Commands:
.menu - Show menu
.ping - Speed test
.jid - Get chat ID
.forward <jid> - Forward message
            `);
        } else if (content === '.ping') {
            const start = Date.now();
            const replyMsg = await message.reply('🏓 Testing...');
            const end = Date.now();
            await replyMsg.edit(`🏓 Pong! ${end - start}ms`);
        } else if (content === '.jid') {
            await message.reply(`📱 Chat JID: ${sender}`);
        } else if (content.startsWith('.forward ')) {
            const jid = content.split(' ')[1];
            if (jid) {
                await message.forward(jid);
                await message.reply('✅ Message forwarded!');
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
<p>Use .menu in WhatsApp to see commands</p>`);
});

app.listen(port, () => {
    console.log(`🌐 Server running on port ${port}`);
});
