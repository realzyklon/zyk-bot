import { exec } from 'child_process'
import { promisify } from 'util'
import search from 'youtube-search-api'
import { writeFileSync, unlinkSync, readFileSync, existsSync, readdirSync } from 'fs'

const execPromise = promisify(exec)

let handler = async (m, { conn, command, args, usedPrefix }) => {
    const cookiePath = './cookies.txt'
    const cookieFlag = existsSync(cookiePath) ? `--cookies ${cookiePath}` : ''

    try {
        await execPromise('yt-dlp --version')
    } catch {
        await execPromise('pip install -U yt-dlp')
    }

    if (command === 'play' && !args.length) {
        return m.reply(`🏮 Uso: \`${usedPrefix}play [titolo]\` per cercare\n\`${usedPrefix}play audio [link]\` per scaricare musica\n\`${usedPrefix}play video [link]\` per scaricare video`)
    }

    if (args[0] === 'audio' || args[0] === 'video') {
        let isAudio = args[0] === 'audio'
        let url = args[1]
        if (!url || !url.includes('youtu')) return m.reply('🏮 Inserisci un link YouTube valido.')

        await m.reply(`⏳ Elaborazione ${isAudio ? 'audio' : 'video'} in corso...`)
        
        let baseName = `${Date.now()}`
        
        // SOLUZIONE: Non specificare formati, lascia che yt-dlp scelga automaticamente
        let cmd = isAudio 
            ? `yt-dlp ${cookieFlag} --extractor-args "youtube:player_client=android" --extract-audio --audio-format mp3 --no-warnings --no-check-certificates --geo-bypass -o "./tmp/${baseName}.%(ext)s" "${url}"`
            : `yt-dlp ${cookieFlag} --extractor-args "youtube:player_client=android" --recode-video mp4 --no-warnings --no-check-certificates --geo-bypass -o "./tmp/${baseName}.%(ext)s" "${url}"`

        try {
            await execPromise(cmd)
            
            let files = readdirSync('./tmp/')
            let found = files.find(f => f.startsWith(baseName))
            if (!found) throw new Error('File non scaricato')
            
            let finalPath = `./tmp/${found}`
            let data = readFileSync(finalPath)
            
            if (isAudio) {
                await conn.sendMessage(m.chat, { audio: data, mimetype: 'audio/mpeg' }, { quoted: m })
            } else {
                await conn.sendMessage(m.chat, { video: data, mimetype: 'video/mp4' }, { quoted: m })
            }
            
            unlinkSync(finalPath)
        } catch (e) {
            console.error(e)
            
            // FALLBACK FINALE: usa solo il client Android senza altre opzioni
            try {
                await m.reply('⚠️ Tentativo con metodo alternativo...')
                
                let simplestCmd = `yt-dlp --extractor-args "youtube:player_client=android" ${isAudio ? '--extract-audio --audio-format mp3' : ''} --no-warnings -o "./tmp/${baseName}.%(ext)s" "${url}"`
                
                await execPromise(simplestCmd)
                
                let files = readdirSync('./tmp/')
                let found = files.find(f => f.startsWith(baseName))
                if (!found) throw new Error('File non scaricato')
                
                let finalPath = `./tmp/${found}`
                let data = readFileSync(finalPath)
                
                if (isAudio) {
                    await conn.sendMessage(m.chat, { audio: data, mimetype: 'audio/mpeg' }, { quoted: m })
                } else {
                    await conn.sendMessage(m.chat, { video: data, mimetype: 'video/mp4' }, { quoted: m })
                }
                
                unlinkSync(finalPath)
            } catch (e2) {
                console.error(e2)
                
                // ULTIMO TENTATIVO: senza cookies
                try {
                    await m.reply('⚠️ Ultimo tentativo senza cookies...')
                    
                    let noCookieCmd = `yt-dlp --extractor-args "youtube:player_client=android" ${isAudio ? '--extract-audio --audio-format mp3' : ''} -o "./tmp/${baseName}.%(ext)s" "${url}"`
                    
                    await execPromise(noCookieCmd)
                    
                    let files = readdirSync('./tmp/')
                    let found = files.find(f => f.startsWith(baseName))
                    if (!found) throw new Error('File non scaricato')
                    
                    let finalPath = `./tmp/${found}`
                    let data = readFileSync(finalPath)
                    
                    if (isAudio) {
                        await conn.sendMessage(m.chat, { audio: data, mimetype: 'audio/mpeg' }, { quoted: m })
                    } else {
                        await conn.sendMessage(m.chat, { video: data, mimetype: 'video/mp4' }, { quoted: m })
                    }
                    
                    unlinkSync(finalPath)
                } catch (e3) {
                    console.error(e3)
                    m.reply(`❌ Download fallito dopo 3 tentativi.\n\n💡 Soluzioni:\n1. Aggiorna yt-dlp: \`pip install -U yt-dlp\`\n2. Il video potrebbe essere geo-bloccato o con restrizioni d'età\n3. Prova a rigenerare cookies.txt\n4. Verifica che ffmpeg sia installato`)
                }
            }
        }
        return
    }

    let query = args.join(' ')
    let results = await search.GetListByKeyword(query, false, 5)
    let videos = results.items

    const cards = videos.map(v => {
        return {
            image: { url: v.thumbnail.thumbnails[0].url },
            title: v.title,
            body: `⏱️ Durata: ${v.lengthText}\n👁️ Views: ${v.viewCountText}`,
            footer: 'YouTube Play',
            buttons: [
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🎵 Audio',
                        id: `${usedPrefix}play audio https://www.youtube.com/watch?v=${v.id}`
                    })
                },
                {
                    name: 'quick_reply',
                    buttonParamsJson: JSON.stringify({
                        display_text: '🎥 Video',
                        id: `${usedPrefix}play video https://www.youtube.com/watch?v=${v.id}`
                    })
                }
            ]
        }
    })

    await conn.sendMessage(m.chat, {
        text: `🔎 Risultati per: *${query}*`,
        cards: cards,
        contextInfo: {
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterJid: global.canale?.id || '',
                newsletterName: global.canale?.nome || ''
            }
        }
    }, { quoted: m })
}

handler.help = ['play']
handler.tags = ['tools']
handler.command = ['play']

export default handler