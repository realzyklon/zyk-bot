import { spawn } from 'child_process'

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) return m.reply(`\`𐔌⚠️꒱\` Inserisci il comando da eseguire.\nEsempio: *${usedPrefix + command}* ping google.com`)

    let messageId = null
    let output = `╭┈➤ 『 💻 』 *TERMINAL LIVE*\n┆  『 ⚙️ 』 \`comando\` ─ *${text}*\n┆\n`
    let lastUpdate = Date.now()

    const shell = spawn('sh', ['-c', text])

    const updateMsg = async (newData) => {
        output += newData
        // Evita il rate limit di WhatsApp aggiornando il messaggio solo ogni 1.5 secondi
        if (Date.now() - lastUpdate > 1500) {
            if (!messageId) {
                let { key } = await conn.sendMessage(m.chat, { text: output + '\n╰┈➤ 『 ⏳ 』 *In corso...*' }, { quoted: m })
                messageId = key
            } else {
                await conn.editMessage(m.chat, messageId, output + '\n╰┈➤ 『 ⏳ 』 *In corso...*')
            }
            lastUpdate = Date.now()
        }
    }

    shell.stdout.on('data', (data) => {
        updateMsg(data.toString())
    })

    shell.stderr.on('data', (data) => {
        updateMsg(`\n[ERRORE]: ${data.toString()}`)
    })

    shell.on('close', async (code) => {
        let finalStatus = code === 0 ? '✅ Completato' : `❌ Fallito (codice ${code})`
        let finalMsg = output + `\n╰┈➤ 『 📦 』 *STATO:* ${finalStatus}`
        
        if (!messageId) {
            await conn.sendMessage(m.chat, { text: finalMsg }, { quoted: m })
        } else {
            await conn.editMessage(m.chat, messageId, finalMsg)
        }
    })
}

handler.help = ['terminal <comando>']
handler.tags = ['tools']
handler.command = /^(terminal|sh)$/i
handler.rowner = true

export default handler