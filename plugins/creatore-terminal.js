import { spawn } from 'child_process'

let handler = async (m, { conn, text }) => {
    if (!text) return 
    
    let messageId = null
    let output = ''
    let lastUpdate = Date.now()

    const shell = spawn('sh', ['-c', text])

    const sendUpdate = async (data) => {
        output += data
        if (Date.now() - lastUpdate > 1500) {
            if (!messageId) {
                let { key } = await conn.sendMessage(m.chat, { text: output }, { quoted: m })
                messageId = key
            } else {
                await conn.editMessage(m.chat, messageId, output)
            }
            lastUpdate = Date.now()
        }
    }

    shell.stdout.on('data', (data) => sendUpdate(data.toString()))
    shell.stderr.on('data', (data) => sendUpdate(data.toString()))

    shell.on('close', async () => {
        if (!messageId) {
            await conn.sendMessage(m.chat, { text: output }, { quoted: m })
        } else {
            await conn.editMessage(m.chat, messageId, output)
        }
    })
}

handler.help = ['sh']
handler.tags = ['tools']
handler.command = /^(sh|terminal)$/i
handler.rowner = true

export default handler