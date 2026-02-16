import { writeFileSync } from 'fs'

async function handleWarn(m, conn, users, reason) {
    const jid = m.chat
    const sender = m.sender
    const maxWarns = 5

    if (!users[sender]) users[sender] = { warns: {} }
    if (!users[sender].warns) users[sender].warns = {}
    if (!users[sender].warns[jid]) users[sender].warns[jid] = 0

    users[sender].warns[jid] += 1
    const count = users[sender].warns[jid]

    await conn.sendMessage(jid, {
        text: `⚠️ *Link Rilevato!* (${reason})\n@${sender.split('@')[0]}, l'invio di questo tipo di link è vietato.\n*Warn:* [ ${count} / ${maxWarns} ]`,
        mentions: [sender],
        ...global.newsletter?.()
    })

    if (count >= maxWarns) {
        users[sender].warns[jid] = 0
        await conn.groupParticipantsUpdate(jid, [sender], 'remove')
        await conn.sendMessage(jid, {
            text: `🚫 @${sender.split('@')[0]} rimosso per aver raggiunto il limite di 5 warn.`,
            mentions: [sender]
        })
    }

    try {
        writeFileSync('./database.json', JSON.stringify(global.db.data, null, 2))
    } catch (e) {}
    return true
}

export async function antilink(m, { conn, isAdmin, isBotAdmin, users }) {
    if (isAdmin || !isBotAdmin || m.fromMe) return false

    const chat = global.db.data.groups?.[m.chat] || global.db.data.chats?.[m.chat]
    if (!chat) return false

    const body = m.text || m.msg?.caption || m.msg?.text || (m.mtype === 'templateButtonReplyMessage' && m.msg?.selectedId) || ''
    if (!body) return false

    const waRegex = /(chat\.whatsapp\.com|channel\.whatsapp\.com)/i
    if (chat.antiwhatsapp && waRegex.test(body)) {
        await conn.sendMessage(m.chat, { delete: m.key })
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        await conn.sendMessage(m.chat, {
            text: `🚫 *ANTI-WHATSAPP*\n@${m.sender.split('@')[0]} è stato rimosso per aver inviato un link di un gruppo/canale WhatsApp.`,
            mentions: [m.sender]
        })
        return true
    }

    const tgRegex = /(t\.me|telegram\.me)/i
    const igRegex = /(instagram\.com)/i

    if (chat.antitelegram && tgRegex.test(body)) {
        await conn.sendMessage(m.chat, { delete: m.key })
        return await handleWarn(m, conn, users, 'Telegram')
    }

    if (chat.antinsta && igRegex.test(body)) {
        await conn.sendMessage(m.chat, { delete: m.key })
        return await handleWarn(m, conn, users, 'Instagram')
    }

    const hardRegex = /((https?:\/\/|www\.)[^\s]+)/i
    if (chat.antilinkhard && hardRegex.test(body)) {
        await conn.sendMessage(m.chat, { delete: m.key })
        return await handleWarn(m, conn, users, 'Link Generico')
    }

    return false
}