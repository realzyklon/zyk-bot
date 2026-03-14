let handler = async (m, { conn }) => {
    let users = global.db.data.users
    let list = Object.keys(users)
        .map(jid => ({
            jid,
            total: (users[jid].money || 0) + (users[jid].bank || 0)
        }))
        .filter(u => u.total > 0)

    list.sort((a, b) => b.total - a.total)
    let top = list.slice(0, 10)

    if (top.length === 0) return m.reply('`𐔌💰꒱` _*Nessun dato trovato.*_')

    let text = `*💰 TOP 10 RICCHI (GLOBALE)*\n\n`
    text += top.map((user, i) => `${i + 1}. @${user.jid.split('@')[0]} : *${user.total}* €`).join('\n')

    await conn.sendMessage(m.chat, { text, mentions: top.map(u => u.jid) }, { quoted: m })
}

handler.command = ['topeuro']
handler.group = true

export default handler