import { writeFileSync } from 'fs'

const handler = async (m, { conn, isOwner }) => {
    if (!isOwner) return

    try {
        const groups = await conn.groupFetchAllParticipating()
        const keys = Object.keys(groups)
        let count = 0

        for (const [jid, metadata] of Object.entries(groups)) {
            if (!global.db.data.chats[jid]) global.db.data.chats[jid] = {}
            
            const chat = global.db.data.chats[jid]
            chat.subject = metadata.subject
            chat.metadata = metadata
            count++
        }

        writeFileSync('./database.json', JSON.stringify(global.db.data, null, 2))

        m.reply(`✅ *SINCRONIZZAZIONE COMPLETATA*\n\n📁 Gruppi aggiornati: ${count}\n💾 Database salvato.`)

    } catch (e) {
        console.error(e)
        m.reply('❌ Errore durante la sincronizzazione dei gruppi.')
    }
}

handler.help = ['sync', 'syncmetadata']
handler.tags = ['owner']
handler.command = ['sync', 'aggiornagruppi', 'syncmetadata']
handler.owner = true

export default handler