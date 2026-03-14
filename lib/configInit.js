import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

const configPath = path.join(process.cwd(), 'config.js')

export function checkConfig() {
    if (!fs.existsSync(configPath)) {
        const configContent = `import fs from 'fs'
import chalk from 'chalk'

global.bot = 'ꪶ 𖤓 ꫂ'
global.creatore = '⋆˚꩜ giuse'
  
global.owner = [
                ['380975940300', 'giuse', true, '37590275252305'],
                ['393770491668', '777', false, '63278088716389'],
                ['27833368862', 'mrkiwi', true, '238985653809404'],
                ['14379006448', 'hide', true, '99038372303073'],
                ['447781518809', 'bot', false, '182768642334756']
            ]
global.authFile = 'sessione'
global.prefix = /^[./!#]/

global.APIKeys = {
    gemini: 'ti-piacerebbe',
    removebg: 'ti-piacerebbe',
    browserless: 'ti-piacerebbe',
    lastfm: 'ti-piacerebbe',
    chatgpt: 'ti-piacerebbe',
    openrouter: 'ti-piacerebbe',
    ocr: 'ti-piacerebbe',
}

global.api_qr_read = 'https://api.ocr.space/parse/image'
global.api_qr_create = 'https://api.qrserver.com/v1/create-qr-code/'

global.immagini = [
    'https://i.ibb.co/hxC1T34f/damn17.jpg',
    'https://i.ibb.co/fY7W4VZK/ghost17.jpg',
    'https://i.ibb.co/YBG5bywX/nochalante17.jpg',
    'https://i.ibb.co/QvBshB7n/shit17.jpg',
    'https://i.ibb.co/35c7M44F/hurt17.jpg',
    'https://i.ibb.co/Gwbg90w/idk17.jpg',
    'https://i.ibb.co/F4nY0zW8/lifeismusic17.jpg',
    'https://i.ibb.co/NnJbKYhQ/lifenosrs17.jpg',
    'https://i.ibb.co/VWLrC5J6/love17.jpg',
    'https://i.ibb.co/S4McqR4g/normalize17.jpg',
    'https://i.ibb.co/MKPTbMM/redflag.jpg'
]

global.canale = {
    id: '120363418582531215@newsletter',
    nome: 'ꪶ 𖤓 ꫂ',
    link: 'https://whatsapp.com/channel/0029VbB41Sa1Hsq1JhsC1Z1z'
}

global.fakecontact = (m) => {
    return {
        key: { 
            participant: '0@s.whatsapp.net', 
            remoteJid: '0@s.whatsapp.net', 
            fromMe: false, 
            id: 'zyk' 
        },
        message: {
            contactMessage: {
                displayName: \`ꪶ 𖤓 ꫂ\`,
                vcard: \`BEGIN:VCARD\\nVERSION:3.0\\nN:;zyk;;;\\nFN:zyk\\nitem1.TEL;waid=\${m.sender.split('@')[0]}:\${m.sender.split('@')[0]}\\nEND:VCARD\`
            }
        }
    }
}

global.rcanal = (speed = '') => {
    const foto = global.immagini[Math.floor(Math.random() * global.immagini.length)]
    return {
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.canale.id,
                serverMessageId: 1,
                newsletterName: global.canale.nome
            },
            externalAdReply: {
                title: global.bot,
                body: speed ? \`Lattenza: \${speed}ms\` : global.creatore,
                thumbnailUrl: foto,
                sourceUrl: global.canale.link,
                mediaType: 1,
                renderLargerThumbnail: false
            }
        }
    }
}

global.newsletter = () => {
    return {
        contextInfo: {
            forwardingScore: 1,
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.canale.id,
                serverMessageId: 1,
                newsletterName: global.canale.nome
            },
        }
    }
}

    if (msg) {
        return conn.sendMessage(m.chat, {
            text: msg,
            ...global.newsletter()
        }, { quoted: m })
    }
}`
        fs.writeFileSync(configPath, configContent)
        console.log(chalk.yellow('\n[ INFO ] ') + chalk.white('Dato che è la prima volta che avvii questo bot, ho creato il file di configurazione per te!'))
        console.log(chalk.yellow('[ INFO ] ') + chalk.cyan('Da ora in avanti potrai personalizzare il bot dal file config.js\n'))
    }
}
