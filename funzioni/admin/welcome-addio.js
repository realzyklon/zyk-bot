import fs from 'fs'

export async function eventsUpdate(conn, anu) {
    try {
        const { id, participants, action, author } = anu
        
        if (!['add', 'remove', 'leave'].includes(action)) return

        const dbPath = './media/eventi.json'
        const db = fs.existsSync(dbPath) ? JSON.parse(fs.readFileSync(dbPath, 'utf-8')) : {}
        
        const chatData = global.db.data.groups?.[id] || global.db.data.chats?.[id]
        if (!chatData || !chatData.welcome) return

        const metadata = await conn.groupMetadata(id)
        const groupName = metadata.subject
        const totalMembers = metadata.participants.length

        for (const user of participants) {
            const jid = conn.decodeJid(user)
            const authorJid = author ? conn.decodeJid(author) : jid
            
            const isKick = (action === 'remove' || action === 'leave') && authorJid !== jid

            let rawText = ''
            if (action === 'add') {
                rawText = db[id]?.welcome || 'benvenuto &user in &gruppo, ora siamo &membri membri'
            } else if (isKick) {
                rawText = '&user è stato rimosso da &author'
            } else {
                rawText = db[id]?.bye || '&user ha abbandonato il gruppo, ora siamo rimasti in &membri '
            }
            
            const caption = rawText
                .replace(/&user/g, `@${jid.split('@')[0]}`)
                .replace(/&author/g, `@${authorJid.split('@')[0]}`)
                .replace(/&gruppo/g, groupName)
                .replace(/&membri/g, totalMembers)

            const mentionsList = isKick ? [jid, authorJid] : [jid]

            const msg = await conn.sendMessage(id, {
                text: caption,
                mentions: mentionsList
            })

            if (action === 'add' && msg) {
                await conn.sendMessage(id, {
                    react: {
                        text: '👋',
                        key: msg.key
                    }
                })
            }
        }
    } catch (e) {
        console.error('[Event Update Error]:', e)
    }
}
