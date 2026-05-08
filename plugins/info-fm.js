import axios from 'axios'
import fs from 'fs'

const LASTFM_API_KEY = global.APIKeys?.lastfm
const def = 'https://i.ibb.co/6fs5B1V/triplo3.jpg'
const lastfmDbPath = './media/lastfm.json'

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
        const { data } = await axios.get(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&limit=1&media=music&country=IT`)
        if (data.results?.[0]?.artworkUrl100) return data.results[0].artworkUrl100.replace('100x100bb', '600x600bb')
    } catch (e) {}
    return def
}

const handler = async (m, { conn, usedPrefix }) => {
    if (!fs.existsSync('./media')) fs.mkdirSync('./media')
    if (!fs.existsSync(lastfmDbPath)) fs.writeFileSync(lastfmDbPath, JSON.stringify({}, null, 2))
    
    const db = JSON.parse(fs.readFileSync(lastfmDbPath, 'utf-8'))
    let targetUser = m.mentionedJid?.[0] || (m.quoted ? m.quoted.sender : m.sender)
    const user = db[targetUser]
    
    if (!user) return conn.sendMessage(m.chat, { text: `『 ⚠️ 』 Utente non registrato su LastFM.` }, { quoted: m })

    try {
        await conn.sendPresenceUpdate('recording', m.chat)
        const res = await apiCall('user.getrecenttracks', { user, limit: 1 })
        const track = res.recenttracks?.track?.[0]
        
        if (!track) return conn.sendMessage(m.chat, { text: '『 ❌ 』 Nessun brano trovato.' }, { quoted: m })

        const isNowPlaying = track['@attr']?.nowplaying === 'true'
        const cover = await fetchCover(track.image, `${track.artist['#text']} ${track.name}`)

        let caption = `
╭┈ 『 🎵 』 \`brano\` ─ *${track.name}*
┆ 『 👤 』 \`artista\` ─ *${track.artist['#text']}*
┆ 『 💿 』 \`album\` ─ *${track.album['#text'] || 'N/A'}*
╰┈➤ 『 ✨ 』 \`stato\` ─ *${isNowPlaying ? '_In riproduzione..._' : '_Ultimo ascolto_'}*`.trim()

        const buttons = [
            { buttonId: `${usedPrefix}play ${track.name} ${track.artist['#text']}`, buttonText: { displayText: '📥 SCARICA AUDIO' }, type: 1 },
            { buttonId: `${usedPrefix}salva ${track.name} | ${track.artist['#text']}`, buttonText: { displayText: '🎧 SALVA BRANO' }, type: 1 },
            { buttonId: `${usedPrefix}playlist`, buttonText: { displayText: '📂 PLAYLIST' }, type: 1 }
        ]

        const buttonMessage = {
            image: { url: cover },
            caption: caption,
            buttons: buttons,
            headerType: 4,
            contextInfo: {
                ...global.newsletter().contextInfo,
                mentionedJid: [targetUser],
            }
        }

        return await conn.sendMessage(m.chat, buttonMessage, { quoted: m })

    } catch (e) { 
        console.error(e)
        return conn.sendMessage(m.chat, { text: '『 ❌ 』 Errore nel caricamento dei dati.' }, { quoted: m })
    }
}

handler.command = ['fm', 'nowplaying']
export default handler