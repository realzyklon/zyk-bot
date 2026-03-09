let handler = m => m

handler.before = async function (m, { conn }) {
    if (!m.sender || m.key.fromMe) return !0

    let user = global.db.data.users[m.sender]
    if (!user || !user.messages) return !0

    const threshold = 120
    const reward = 450

    if (user.messages > 0 && user.messages % threshold === 0) {
        user.money = (user.money || 0) + reward
        
        let testo = `@${m.sender.split('@')[0]} hai scritto ${user.messages} messaggi, hai guadagnato ${reward}€!🎉🎉`

        await conn.sendMessage(m.chat, {
            text: testo,
            mentions: [m.sender]
        }, { quoted: m })
    }

    return !0
}

export default handler