import fetch from 'node-fetch'

let handler = async (m, { conn, usedPrefix, command, args }) => {
    const jid = m.chat
    
    global.db.data.groups[jid] = global.db.data.groups[jid] || { rileva: false, welcome: true, antilink: true }
    let settings = global.db.data.groups[jid]

    if (command === 'funzioni' || !args.length) {
        let menu = `⛩️ ╰┈➤ *PANNELLO ADMIN* 🏮\n\n`
        
        menu += `${settings.rileva ? '🟢' : '🔴'} *rileva*\n`
        menu += `${settings.welcome ? '🟢' : '🔴'} *welcome*\n`
        menu += `${settings.antilink ? '🟢' : '🔴'} *antilink*\n\n`
        
        menu += `📝 *_Come gestire le funzioni_:*\n`
        menu += `╰┈➤ Usa \`${usedPrefix}attiva <nome>\`\n`
        menu += `╰┈➤ Usa \`${usedPrefix}disattiva <nome>\`\n\n`
        menu += `🉐 _${global.bot}_`

        return await conn.sendMessage(jid, { 
            text: menu,
            contextInfo: {
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: global.canale.id,
                    newsletterName: global.canale.nome
                }
            }
        }, { quoted: m })
    }

    let isEnable = /attiva|on|1/i.test(command)
    let type = args[0].toLowerCase()
    let featureName = ""

    switch (type) {
        case 'rileva':
            settings.rileva = isEnable
            featureName = 'Rileva'
            break
        case 'welcome':
            settings.welcome = isEnable
            featureName = 'Benvenuto'
            break
        case 'antilink':
            settings.antilink = isEnable
            featureName = 'Antilink'
            break
        default:
            return m.reply(`🏮 ╰┈➤ Modulo \`${type}\` non trovato.`)
    }

    let confText = `🏮 *Funzione:* \`${featureName}\`\n` +
                   `🧧 *Stato:* ${isEnable ? '🟢 ATTIVATA' : '🔴 DISATTIVATA'}`

    await conn.sendMessage(jid, { text: confText }, { quoted: m })
}

handler.help = ['funzioni', 'attiva', 'disattiva']
handler.tags = ['admin']
handler.command = ['funzioni', 'attiva', 'disattiva']
handler.group = true
handler.admin = true

export default handler