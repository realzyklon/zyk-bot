import axios from 'axios'
import fs from 'fs'

const LASTFM_API_KEY = global.APIKeys?.lastfm
const plPath = './media/playlists.json'

async function fetchTrackData(query) {
    try {
        const q = new URLSearchParams({ method: 'track.search', track: query, api_key: LASTFM_API_KEY, format: 'json', limit: 1 })
        const res = await axios.get(`https://ws.audioscrobbler.com/2.0/?${q}`)
        const track = res.data.results?.trackmatches?.track?.[0]
        if (!track) return null
        
        const q2 = new URLSearchParams({ method: 'track.getInfo', artist: track.artist, track: track.name, api_key: LASTFM_API_KEY, format: 'json' })
        const res2 = await axios.get(`https://ws.audioscrobbler.com/2.0/?${q2}`)
        const details = res2.data.track || {}
        return {
            title: details.name || track.name,
            artist: details.artist?.name || track.artist,
            image: details.album?.image?.find(i => i.size === 'extralarge')?.['#text'] || 'https://i.ibb.co/hJW7WwxV/varebot.jpg',
            duration: parseInt(details.duration) || 0
        }
    } catch (e) { return null }
}

const handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!fs.existsSync(plPath)) fs.writeFileSync(plPath, JSON.stringify({}))
    let pl = JSON.parse(fs.readFileSync(plPath, 'utf-8'))

    if (command === 'delplaylist') {
        if (!text || !pl[m.sender]?.[text]) return m.reply('『 ❌ 』 Playlist non trovata.')
        delete pl[m.sender][text]
        fs.writeFileSync(plPath, JSON.stringify(pl, null, 2))
        return m.reply(`『 ✅ 』 Playlist *${text}* eliminata.`)
    }

    if (command === 'delbrano') {
        let [plName, index] = text.split('|').map(v => v.trim())
        if (!pl[m.sender]?.[plName]) return m.reply('『 ❌ 』 Playlist non trovata.')
        let i = parseInt(index) - 1
        if (isNaN(i) || !pl[m.sender][plName][i]) return m.reply('『 ❌ 』 Numero brano non valido.')
        let removed = pl[m.sender][plName].splice(i, 1)
        fs.writeFileSync(plPath, JSON.stringify(pl, null, 2))
        return m.reply(`『 ✅ 』 Rimosso: *${removed[0].title}*`)
    }

    if (command === 'salva') {
        let [song, plName] = text.split('|').map(v => v.trim())
        if (!song) return m.reply(`『 ❌ 』 Uso: ${usedPrefix}salva Canzone | Playlist`)
        if (!pl[m.sender] || Object.keys(pl[m.sender]).length === 0) return m.reply('『 ⚠️ 』 Crea una playlist: .cplaylist nome')

        if (!plName) {
            let buttons = Object.keys(pl[m.sender]).map(name => ({
                buttonId: `${usedPrefix}salva ${song} | ${name}`,
                buttonText: { displayText: name }, type: 1
            }))
            return conn.sendMessage(m.chat, { text: `『 🎵 』 In quale playlist salvi "${song}"?`, buttons }, { quoted: m })
        }

        await conn.sendPresenceUpdate('recording', m.chat)
        const data = await fetchTrackData(song)
        if (!data) return m.reply('『 ❌ 』 Canzone non trovata.')

        // Controllo duplicati
        const exists = pl[m.sender][plName].some(s => s.title.toLowerCase() === data.title.toLowerCase() && s.artist.toLowerCase() === data.artist.toLowerCase())
        if (exists) return m.reply(`『 ⚠️ 』 *${data.title}* è già presente in questa playlist.`)

        pl[m.sender][plName].push(data)
        fs.writeFileSync(plPath, JSON.stringify(pl, null, 2))
        
        return conn.sendMessage(m.chat, {
            text: `『 ✅ 』 *${data.title}* salvata in *${plName}*!`,
            buttons: [{ buttonId: `${usedPrefix}playlist ${plName}`, buttonText: { displayText: '📂 Apri Playlist' }, type: 1 }]
        }, { quoted: m })
    }
}

handler.command = ['salva', 'delplaylist', 'delbrano']
export default handler