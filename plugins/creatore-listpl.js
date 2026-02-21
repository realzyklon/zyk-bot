import fs from 'fs'
import path from 'path'

const handler = async (m, { conn }) => {
    const pluginPath = path.join(process.cwd(), 'plugins')
    const files = fs.readdirSync(pluginPath).filter(v => v.endsWith('.js'))
    
    const list = files.map((v, i) => `┆  ${i + 1}. *${v}*`).join('\n')
    const textMsg = `╭┈  『 📁 』 \`plugins\` ─ *LISTA*\n${list}\n╰┈➤ 『 📦 』 \`totale\` ─ *${files.length}*`

    const q = global.fakecontact ? global.fakecontact(m) : m
    const extra = global.rcanal ? global.rcanal() : (global.newsletter ? global.newsletter() : {})

    await conn.sendMessage(m.chat, {
        text: textMsg,
        ...extra
    }, { quoted: q })
}

handler.help = ['listpl']
handler.tags = ['owner']
handler.command = ['listpl', 'listaplugins']
handler.owner = true

export default handler
