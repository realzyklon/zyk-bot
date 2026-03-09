import { downloadContentFromMessage } from '@realvare/baileys'

const handler = async (m, { conn }) => {
    const q = m.quoted ? m.quoted : m
    const mime = (q.msg || q).mimetype || ''

    if (!/document|text/.test(mime)) {
        throw '『 ⚠️ 』- `Rispondi a un documento o a un file di testo.`'
    }

    try {
        const mtype = q.mtype || 'documentMessage'
        const messageContent = q.msg || q[mtype]

        // Download del buffer usando la libreria del bot
        let stream = await downloadContentFromMessage(messageContent, 'document')
        let buffer = Buffer.from([])
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk])
        }

        if (!buffer || buffer.length === 0) throw 'Impossibile leggere il file.'

        // Conversione del buffer in stringa (UTF-8)
        const textContent = buffer.toString('utf-8').trim()

        if (!textContent) throw 'Il file sembra essere vuoto o non contiene testo leggibile.'

        // Se il testo è troppo lungo (oltre 4000 caratteri), lo mandiamo come messaggio spezzato o file
        if (textContent.length > 4000) {
            await conn.sendMessage(m.chat, {
                text: textContent.slice(0, 4000) + '\n\n... [Testo troncato perché troppo lungo]'
            }, { quoted: m })
        } else {
            await conn.sendMessage(m.chat, { text: textContent }, { quoted: m })
        }

    } catch (e) {
        console.error(e)
        m.reply('❌ Errore durante la conversione del documento in testo. Assicurati che sia un formato leggibile (txt, log, html, etc).')
    }
}

handler.help = ['totxt']
handler.tags = ['tools']
handler.command = /^(totxt|readfile)$/i

export default handler