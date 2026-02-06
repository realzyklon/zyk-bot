import axios from 'axios'
import fs from 'fs'

const LASTFM_API_KEY = global.APIKeys?.lastfm
const BROWSERLESS_KEY = global.APIKeys?.browserless
const def = 'https://i.ibb.co/hJW7WwxV/varebot.jpg'

async function apiCall(method, params) {
    try {
        const query = new URLSearchParams({ method, api_key: LASTFM_API_KEY, format: 'json', ...params })
        const res = await axios.get(`https://ws.audioscrobbler.com/2.0/?${query}`, { timeout: 5000 })
        return res.data
    } catch (e) { return {} }
}

async function fetchCover(lastFmImages, query) {
    let cover = lastFmImages?.find(i => i.size === 'extralarge')?.['#text']
    if (cover && cover.trim() !== '' && !cover.includes('2a96cbd8b46e442fc41c2b86b821562f')) return cover
    try {
        const searchUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=1&media=music&country=IT`
        const { data } = await axios.get(searchUrl)
        if (data.results?.[0]?.artworkUrl100) return data.results[0].artworkUrl100.replace('100x100bb', '600x600bb')
    } catch (e) {}
    return def
}

const handler = async (m, { conn, usedPrefix, command }) => {
    const db = JSON.parse(fs.readFileSync('./media/lastfm.json', 'utf-8'))
    let targetUser = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : m.sender)
    const user = db[targetUser]
    
    if (!user) return m.reply(`『 ⚠️ 』 Utente non registrato!`)
    if (!LASTFM_API_KEY || !BROWSERLESS_KEY) return m.reply('『 ❌ 』 API Keys mancanti.')

    try {
        await conn.sendPresenceUpdate('recording', m.chat)
        const res = await apiCall('user.getrecenttracks', { user, limit: 1 })
        const track = res.recenttracks?.track?.[0]
        if (!track) return m.reply('『 ❌ 』 Nessun brano trovato.')

        const info = await apiCall('track.getInfo', { artist: track.artist['#text'], track: track.name, username: user })
        const trackData = info.track || {}
        const cover = await fetchCover(track.image, `${track.artist['#text']} ${track.name}`)
        const isNowPlaying = track['@attr']?.nowplaying === 'true'
        const statusLabel = isNowPlaying ? 'sta ascoltando' : 'ha ascoltato'

        const html = `<html><head><style>@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');body { margin: 0; padding: 0; width: 1000px; height: 600px; display: flex; align-items: center; justify-content: center; font-family: 'Plus Jakarta Sans', sans-serif; background: #000; overflow: hidden; }.background { position: absolute; width: 100%; height: 100%; background: url('${cover}') center/cover; filter: blur(30px) brightness(0.7); opacity: 0.7; }.glass-card { position: relative; width: 880px; height: 480px; background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px) saturate(180%); border: 1px solid rgba(255, 255, 255, 0.12); border-radius: 50px; display: flex; align-items: center; padding: 45px; box-sizing: border-box; box-shadow: 0 20px 50px rgba(0,0,0,0.4); }.album-art { width: 340px; height: 340px; border-radius: 35px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); object-fit: cover; }.details { flex: 1; margin-left: 50px; color: white; }.status { font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 3px; color: ${isNowPlaying ? '#32d74b' : '#ff3b30'}; margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }.track-name { font-size: 44px; font-weight: 800; line-height: 1.1; margin-bottom: 10px; letter-spacing: -1.5px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; max-width: 400px; }.artist-name { font-size: 26px; color: rgba(255,255,255,0.6); font-weight: 600; margin-bottom: 30px; }.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }.stat-item { background: rgba(255, 255, 255, 0.04); padding: 15px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.05); }.stat-label { font-size: 10px; color: rgba(255,255,255,0.3); text-transform: uppercase; font-weight: 800; margin-bottom: 4px; }.stat-value { font-size: 20px; font-weight: 700; color: #fff; }</style></head><body><div class="background"></div><div class="glass-card"><img src="${cover}" class="album-art" /><div class="details"><div class="status"><span style="width:10px; height:10px; background:currentColor; border-radius:50%; box-shadow: 0 0 5px currentColor;"></span>${isNowPlaying ? 'In Riproduzione' : 'Ultimo Ascoltato'}</div><div class="track-name">${track.name}</div><div class="artist-name">${track.artist['#text']}</div><div class="stats-grid"><div class="stat-item"><div class="stat-label">I Tuoi Ascolti</div><div class="stat-value">${trackData.userplaycount || 0}</div></div><div class="stat-item"><div class="stat-label">Ascolti Globali</div><div class="stat-value">${parseInt(trackData.playcount || 0).toLocaleString()}</div></div><div class="stat-item"><div class="stat-label">Utente</div><div class="stat-value" style="color:#0a84ff;">@${user}</div></div><div class="stat-item"><div class="stat-label">Ascoltatori</div><div class="stat-value">${parseInt(trackData.listeners || 0).toLocaleString()}</div></div></div></div></div></body></html>`

        const response = await axios.post(`https://chrome.browserless.io/screenshot?token=${BROWSERLESS_KEY}`, {
            html, options: { type: 'jpeg', quality: 85 }, viewport: { width: 1000, height: 600 }
        }, { responseType: 'arraybuffer' })

        const phoneNumber = targetUser.split('@')[0]
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;${user};;;\nFN:${user}\nTEL;type=CELL;type=VOICE;waid=${phoneNumber}:${phoneNumber}\nEND:VCARD`
        
        const buttons = [{ buttonId: `${usedPrefix}salva ${track.name} - ${track.artist['#text']}`, buttonText: { displayText: '❤️ Salva in Playlist' }, type: 1 }]

        return conn.sendMessage(m.chat, {
            image: Buffer.from(response.data),
            caption: `@${phoneNumber} ${statusLabel}:\n*${track.name}*`,
            mentions: [targetUser],
            buttons
        }, { quoted: { key: { fromMe: false, participant: targetUser, remoteJid: m.chat }, message: { contactMessage: { displayName: user, vcard } } } })
    } catch (e) { return m.reply('『 ❌ 』 Errore.') }
}

handler.command = ['cur', 'nowplaying']
export default handler