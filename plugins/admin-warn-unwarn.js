const handler = async (m, { conn, command, text }) => {
    // 1. Estrazione ID (Tag o Reply)
    let who = m.quoted ? m.quoted.sender : m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : false

    // 2. Se non c'è tag/reply ma c'è testo (es. .warn 39333...)
    if (!who && text) {
        let jid = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
        who = jid
    }

    if (!who) return m.reply(`🏮 ╰┈➤ Tagga o menziona qualcuno`)

    // 3. SUPER-FIX: Pulizia forzata del LID
    // decodeJid pulisce i :1 o :47, toJid normalizza.
    who = conn.decodeJid(who)

    // Se Baileys continua a passare il LID puro, forziamo il recupero del JID reale
    // controllando se l'ID è nel formato LID (spesso inizia con numeri lunghi e strani)
    if (who.includes('lid') || (who.split('@')[0].length > 13)) {
        // Cerchiamo nei contatti o nel database se esiste una mappatura
        let userInDb = Object.keys(global.db.data.users).find(key => key.includes(who.split('@')[0]))
        if (userInDb) who = userInDb
    }

    // 4. Inizializzazione database (Percorso corretto: global.db.data.users)
    if (!global.db.data.users[who]) global.db.data.users[who] = { warns: {} }
    let user = global.db.data.users[who]
    
    if (!user.warns) user.warns = {}
    if (typeof user.warns[m.chat] === 'undefined') user.warns[m.chat] = 0

    if (command === 'warn') {
        user.warns[m.chat] += 1

        if (user.warns[m.chat] >= 5) {
            user.warns[m.chat] = 0 
            
            await conn.sendMessage(m.chat, { 
                text: `🉐 ╰┈➤ Utente *@${who.split('@')[0]}* rimosso per aver raggiunto 5 avvertimenti! 🐉`,
                mentions: [who]
            }, { quoted: m })
            
            // Tentativo di espulsione
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove').catch(e => {
                console.error("Errore Kick:", e)
            })
            
        } else {
            await conn.sendMessage(m.chat, { 
                text: `⚠️ ╰┈➤ *@${who.split('@')[0]}* ha ricevuto un avvertimento! *(${user.warns[m.chat]}/5)* 🏮`,
                mentions: [who],
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.canale.id,
                        newsletterName: global.canale.nome
                    }
                }
            }, { quoted: m })
        }
    }

    if (command === 'unwarn') {
        if (user.warns[m.chat] > 0) {
            user.warns[m.chat] -= 1
            await conn.sendMessage(m.chat, { 
                text: `⛩️ ╰┈➤ Avvertimento rimosso a *@${who.split('@')[0]}*! Rimanenti: *(${user.warns[m.chat]}/5)* 🉐`,
                mentions: [who],
                contextInfo: {
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: global.canale.id,
                        newsletterName: global.canale.nome
                    }
                }
            }, { quoted: m })
        } else {
            m.reply(`🏮 ╰┈➤ *@${who.split('@')[0]}* non ha avvertimenti in questo gruppo`, null, { mentions: [who] })
        }
    }
}

handler.command = ['warn', 'unwarn']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler