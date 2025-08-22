const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Session ID from Heroku Config Vars
const SESSION_ID = process.env.SESSION_ID || 'default-session';

console.log('🚀 Starting WhatsApp Bot on 2X Plan...');
console.log('💪 2X CPU - 1GB RAM - No Sleep');
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
            '--disable-gpu',
            '--memory-pressure-level=high'
        ]
    },
    // 2X Plan Optimization
    takeoverOnConflict: true,
    takeoverTimeoutMs: 60000,
    restartOnAuthFail: true
});

// QR Code Generation
client.on('qr', (qr) => {
    console.log('📡 QR Code received! Scan with WhatsApp');
    qrcode.generate(qr, { small: true });
});

// Bot Ready
client.on('ready', () => {
    console.log('✅ Client is ready on 2X Plan!');
    console.log('⚡ 2X CPU - Better Performance');
    console.log('💾 1GB RAM - More Memory');
    console.log('🌙 Never Sleeps - 24/7 Online');
});

// Message Handling with Better Performance
client.on('message', async message => {
    try {
        const content = message.body.toLowerCase();
        const sender = message.from;

        if (content === '.menu') {
            const menuText = `
⚡ *2X POWER BOT* ⚡

🤖 *BOT MENU* 🤖

📋 *Commands:*
🎧 .menu - Show menu
⚡ .ping - Speed test  
🆔 .jid - Get chat ID
📤 .forward <jid> - Forward message

⭐ *2X Plan Features:*
• 2X CPU - Faster Speed
• 1GB RAM - More Memory
• Never Sleeps - 24/7 Online
• Team Supported - Collaboration

🔧 *Running on:* Heroku 2X Basic Plan
            `;
            await client.sendMessage(sender, menuText);
        }
        else if (content === '.ping') {
            const start = Date.now();
            const replyMsg = await message.reply('🏓 Testing 2X speed...');
            const end = Date.now();
            await replyMsg.edit(`🏓 Pong! 2X Speed: ${end - start}ms`);
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

// Initialize client with error handling
client.initialize().catch(error => {
    console.log('❌ Client initialization failed:', error.message);
    console.log('🔄 Restarting in 5 seconds...');
    setTimeout(() => {
        client.initialize();
    }, 5000);
});

// Enhanced keep-alive for 2X plan
app.get('/', (req, res) => {
    res.send(`
        <h1>🤖 WhatsApp Bot Running on 2X Plan</h1>
        <p>⚡ 2X CPU - 1GB RAM - No Sleep</p>
        <p>📱 Session ID: ${SESSION_ID}</p>
        <p>💪 Use .menu in WhatsApp to see features</p>
    `);
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'active',
        plan: '2x_basic',
        memory: '1GB',
        cpu: '2x',
        uptime: process.uptime(),
        session: SESSION_ID
    });
});

app.listen(port, () => {
    console.log(`🌐 Server running on port ${port}`);
    console.log(`💪 2X Basic Plan - Optimized`);
    console.log(`📊 Health check: http://localhost:${port}/health`);
});
