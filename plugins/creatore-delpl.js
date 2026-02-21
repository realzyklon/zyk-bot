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

    const name = text.endsWith('.js') ? text : `${text}.js`
    const pluginPath = path.join(process.cwd(), 'plugins', name)

    if (!fs.existsSync(pluginPath)) {
        return conn.sendMessage(m.chat, {
            text: `╭┈  『 ⚠️ 』 \`errore\`\n╰┈➤ Il plugin *${name}* non esiste.`,
            ...extra
        }, { quoted: q })
    }

    fs.unlinkSync(pluginPath)

    const textMsg = `╭┈  『 🗑️ 』 \`plugins\` ─ *ELIMINAZIONE*\n┆  『 📄 』 \`file\` ─ *${name}*\n╰┈➤ 『 ✅ 』 \`stato\` ─ *Eliminato con successo*`

    await conn.sendMessage(m.chat, {
        text: textMsg,
        ...extra
    }, { quoted: q })
}

handler.help = ['delpl <nome>']
handler.tags = ['owner']
handler.command = ['delpl', 'delplugin']
handler.owner = true

export default handler
