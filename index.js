const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');

require('dotenv').config();

const sessionData = process.env.SESSION_DATA
  ? JSON.parse(process.env.SESSION_DATA)
  : null;

const client = new Client({
    authStrategy: sessionData ? undefined : new LocalAuth(),
    session: sessionData || undefined
});

client.on('qr', qr => {
    qrcode.generate(qr, { small: true });
    console.log('Scan the QR code above');
});

client.on('ready', () => {
    console.log('NEXTY Bot is ready!');
});

client.on('message', async msg => {
    const chat = await msg.getChat();

    if(msg.body.toLowerCase() === '.menu') {
        const menuText = `*NEXTY BOT MENU*\n\n.ping - Bot status\n.jid - Get your JID\n.forward - Forward a message\n.owner - Bot owner info`;
        msg.reply(menuText);

        const voiceUrl = 'https://files.catbox.moe/9j4qg6.mp3';
        const response = await axios.get(voiceUrl, { responseType: 'arraybuffer' });
        const media = new MessageMedia('audio/mpeg', Buffer.from(response.data).toString('base64'));
        msg.reply(media);
    }

    if(msg.body.toLowerCase() === '.ping') {
        msg.reply('Pong! ✅ Bot is online');
    }

    if(msg.body.toLowerCase() === '.jid') {
        msg.reply(`Your JID: ${msg.from}`);
    }

    if(msg.body.toLowerCase() === '.owner') {
        msg.reply('Owner: FLEX AI / NEXTY Team');
    }

    if(msg.body.toLowerCase().startsWith('.forward')) {
        if(msg.hasQuotedMsg) {
            const quoted = await msg.getQuotedMessage();
            chat.sendMessage(quoted.body);
        } else {
            msg.reply('Please reply to a message with .forward');
        }
    }
});

client.initialize();
