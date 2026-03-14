let handler = m => m
handler.before = async function (m, { conn, isAdmin, isOwner }) {
    if (m.isBaileys || !m.isGroup) return 
    const chat = global.db.data.groups[m.chat]
    if (chat?.soloadmin && !isAdmin && !isOwner && !m.fromMe) {
        return false
    }
}

export default handler
