import axios from 'axios'
import fs from 'fs'
import { join } from 'path'
import PhoneNumber from 'awesome-phonenumber'
import { detectDevice } from '../lib/device.js'

const BROWSERLESS_KEY = global.APIKeys?.browserless
const tmpDir = './media/tmp/info'

const handler = async (m, { conn, usedPrefix }) => {
    const device = detectDevice(m.key.id)
    const number = m.sender.split('@')[0]
    
    // Recupero nome reale
    const nomeUtente = await conn.getName(m.sender) || m.pushName || number
    const formattedNumber = PhoneNumber('+' + number).getNumber('international')
    
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true })

    let pfp
    try {
        pfp = await conn.profilePictureUrl(m.sender, 'image')
    } catch {
        pfp = 'https://i.ibb.co/Gwbg90w/idk17.jpg'
    }
    
    const userData = global.db.data.users[m.sender] || { messages: 0, warns: {} }
    const userMsgs = userData.messages || 0
    const warnsCount = Object.keys(userData.warns || {}).length
    const allUsers = Object.entries(global.db.data.users || {}).sort((a, b) => (b[1].messages || 0) - (a[1].messages || 0))
    const globalRank = allUsers.findIndex(u => u[0] === m.sender) + 1

    let lastSong = "Not connected"
    try {
        const lastfmData = JSON.parse(fs.readFileSync('./media/lastfm.json', 'utf-8') || '{}')
        const lastfmUser = lastfmData[m.sender]
        if (lastfmUser) {
            const songsDb = JSON.parse(fs.readFileSync('./media/canzoni.json', 'utf-8') || '{}')
            const lastS = Object.values(songsDb).filter(s => s.user === lastfmUser).sort((a, b) => b.timestamp - a.timestamp)[0]
            if (lastS) lastSong = `${lastS.title} - ${lastS.artist}`
        }
    } catch { lastSong = "Not connected" }

    const html = `<html><head><style>
        @import url('https://fonts.googleapis.com/css2?family=Figtree:wght@400;700;900&display=swap');
        body { margin: 0; padding: 0; width: 1280px; height: 640px; display: flex; align-items: center; justify-content: center; font-family: 'Figtree', sans-serif; background: #000; overflow: hidden; }
        .bg { position: absolute; width: 100%; height: 100%; background: url('${pfp}') center/cover; filter: blur(50px) brightness(0.4); transform: scale(1.1); }
        .container { position: relative; width: 1150px; height: 500px; background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 40px; display: flex; align-items: center; padding: 50px; box-sizing: border-box; }
        .pfp-circle { width: 300px; height: 300px; border-radius: 50%; border: 6px solid rgba(255,255,255,0.1); background: url('${pfp}') center/cover; }
        .info { margin-left: 50px; color: white; flex-grow: 1; }
        .name { font-size: 50px; font-weight: 900; margin-bottom: 5px; color: #fff; text-transform: uppercase; }
        .number { font-size: 22px; color: rgba(255,255,255,0.5); margin-bottom: 30px; font-weight: 700; }
        .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .stat-card { background: rgba(255,255,255,0.05); padding: 15px 20px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.05); }
        .stat-label { font-size: 13px; text-transform: uppercase; color: rgba(255,255,255,0.4); font-weight: 800; margin-bottom: 2px; }
        .stat-value { font-size: 26px; font-weight: 900; color: #fff; }
        .music-bar { margin-top: 30px; background: rgba(255, 255, 255, 0.05); padding: 12px 20px; border-radius: 100px; display: flex; align-items: center; border: 1px solid rgba(255, 255, 255, 0.1); }
        .music-text { font-size: 17px; font-weight: 700; color: #1DB954; }
    </style></head><body>
        <div class="bg"></div>
        <div class="container">
            <div class="pfp-circle"></div>
            <div class="info">
                <div class="name">${nomeUtente}</div>
                <div class="number">${formattedNumber}</div>
                <div class="grid">
                    <div class="stat-card"><div class="stat-label">Messages</div><div class="stat-value">${userMsgs}</div></div>
                    <div class="stat-card"><div class="stat-label">Warns</div><div class="stat-value">${warnsCount}</div></div>
                    <div class="stat-card"><div class="stat-label">Global Rank</div><div class="stat-value">#${globalRank}</div></div>
                    <div class="stat-card"><div class="stat-label">Device</div><div class="stat-value">${device.toUpperCase()}</div></div>
                </div>
                ${lastSong !== "Not connected" ? `
                <div class="music-bar">
                    <span class="music-text">♫ ${lastSong}</span>
                </div>` : ''}
            </div>
        </div>
    </body></html>`

    const txt = `
  ╭┈  『 👤 』 \`utente\` ─ ${nomeUtente}
  ┆  『 💬 』 \`statistiche\`
  ┆  ╰➤  \`messaggi\` ─ *${userMsgs}*
  ┆  ╰➤  \`warns\` ─ *${warnsCount}*
  ┆  ╰➤  \`rank\` ─ *#${globalRank || 'N/A'}*
  ╰┈➤ 『 📦 』 \`declare system\`
`.trim()

    try {
        const screenshot = await axios.post(`https://chrome.browserless.io/screenshot?token=${BROWSERLESS_KEY}`, {
            html,
            options: { type: 'jpeg', quality: 90 },
            viewport: { width: 1280, height: 640 }
        }, { responseType: 'arraybuffer' })

        const fileName = join(tmpDir, `info_${Date.now()}.jpg`)
        fs.writeFileSync(fileName, Buffer.from(screenshot.data))

        await conn.sendMessage(m.chat, {
            text: ``,
            cards: [{
                image: { url: fileName },
                body: txt,
                buttons: [
                    { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '💬 Contatta', url: `https://wa.me/${number}` }) }
                ]
            }],
            contextInfo: { ...global.fakecontact(m).contextInfo }
        }, { quoted: m })

        setTimeout(() => { if (fs.existsSync(fileName)) fs.unlinkSync(fileName) }, 15000)
    } catch (e) {
        await conn.sendMessage(m.chat, {
            text: txt,
            cards: [{
                image: { url: pfp },
                body: txt,
                buttons: [
                    { name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: '💬 Contatta', url: `https://wa.me/${number}` }) }
                ]
            }]
        }, { quoted: m })
    }
}

handler.command = ['info']
export default handler