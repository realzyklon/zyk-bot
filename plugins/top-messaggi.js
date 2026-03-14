let handler = async (m, { conn }) => {
    let users = global.db.data.users
    let list = Object.keys(users)
        .map(jid => ({ jid, messages: users[jid].messages || 0 }))
        .filter(u => u.messages > 0)

    list.sort((a, b) => b.messages - a.messages)
    let top = list.slice(0, 10)
    
    if (top.length === 0) return m.reply('`𐔌📊꒱` _*Nessun dato trovato.*_')

    let text = `*🏆 TOP 10 MESSAGGI (GLOBALE)*\n\n`
    text += top.map((user, i) => `${i + 1}. @${user.jid.split('@')[0]} : *${user.messages}* msg`).join('\n')

    await conn.sendMessage(m.chat, { text, mentions: top.map(u => u.jid) }, { quoted: m })
}

handler.command = ['topmessaggi']
handler.group = true

export default handler