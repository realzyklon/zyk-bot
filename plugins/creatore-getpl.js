import fs from 'fs'
import path from 'path'

const handler = async (m, { conn, text, usedPrefix, command }) => {
    const q = global.fakecontact ? global.fakecontact(m) : m
    const extra = global.rcanal ? global.rcanal() : (global.newsletter ? global.newsletter() : {})

    if (!text) {
        return conn.sendMessage(m.chat, {
            text: `╭┈  『 ⚠️ 』 \`errore\`\n┆  Inserisci il nome del plugin.\n╰┈➤ Esempio: *${usedPrefix + command} menu*`,
            ...extra
        }, { quoted: q })
    }

    let action = ''
    let pluginName = text.trim()

    if (pluginName.endsWith('--code')) {
        action = 'code'
        pluginName = pluginName.replace('--code', '').trim()
    } else if (pluginName.endsWith('--file')) {
        action = 'file'
        pluginName = pluginName.replace('--file', '').trim()
    }

    const fileName = pluginName.endsWith('.js') ? pluginName : `${pluginName}.js`
    const pluginPath = path.join(process.cwd(), 'plugins', fileName)

    if (!fs.existsSync(pluginPath)) {
        return conn.sendMessage(m.chat, {
            text: `╭┈  『 ⚠️ 』 \`errore\`\n╰┈➤ Il plugin *${fileName}* non esiste.`,
            ...extra
        }, { quoted: q })
    }

    if (!action) {
        const textMsg = `╭┈  『 📥 』 \`plugins\` ─ *DOWNLOAD*\n┆  『 📄 』 \`file\` ─ *${fileName}*\n╰┈➤ Scegli il formato:`
        
        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "💻 CODICE",
                    id: `${usedPrefix + command} ${pluginName} --code`
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "📁 FILE",
                    id: `${usedPrefix + command} ${pluginName} --file`
                })
            }
        ]

        const msg = {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        header: { title: '', hasMediaAttachment: false },
                        body: { text: textMsg },
                        footer: { text: "" },
                        nativeFlowMessage: { buttons: buttons },
                        contextInfo: {
                            ...(extra.contextInfo || {}),
                            mentionedJid: [m.sender],
                            stanzaId: m.key.id,
                            participant: m.sender,
                            quotedMessage: m.message
                        }
                    }
                }
            }
        }
        return await conn.relayMessage(m.chat, msg, {})
    }

    if (action === 'code') {
        const content = fs.readFileSync(pluginPath, 'utf-8')
        return conn.sendMessage(m.chat, {
            text: content,
            ...extra
        }, { quoted: q })
    }

    if (action === 'file') {
        const content = fs.readFileSync(pluginPath)
        return conn.sendMessage(m.chat, {
            document: content,
            mimetype: 'application/javascript',
            fileName: fileName,
            caption: `╭┈  『 📦 』 \`file\` ─ *${fileName}*\n╰┈➤ Ecco il file sorgente.`,
            ...extra
        }, { quoted: q })
    }
}

handler.help = ['getpl <nome>']
handler.tags = ['owner']
handler.command = ['getpl', 'getplugin']
handler.owner = true

export default handler
