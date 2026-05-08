import { exec } from 'child_process'
import { promisify } from 'util'

const execPromise = promisify(exec)

let handler = async (m, { conn }) => {
    try {
        const { stdout } = await execPromise('npm list --depth=0 --json')
        const packageData = JSON.parse(stdout)
        const dependencies = packageData.dependencies || {}

        let statusTxt = `╭┈➤ 『 📦 』 *STATUS MODULI*\n`
        statusTxt += `┆  『 🤖 』 *BOT:* ${packageData.name || 'annoyed-bot'}\n`
        statusTxt += `┆  『 🏷️ 』 *VERSIONE:* ${packageData.version || '1.0.0'}\n`
        statusTxt += `┆\n`
        statusTxt += `┆  *DIPENDENZE:*\n`

        Object.keys(dependencies).forEach(dep => {
            statusTxt += `┆  ◦ \`${dep}\` ─ *${dependencies[dep].version}*\n`
        })

        statusTxt += `╰┈➤ 『 📦 』 \`annoyed system\``

        await conn.sendMessage(m.chat, {
            text: statusTxt,
            contextInfo: {
                externalAdReply: {
                    title: "NODE MODULES CHECKER",
                    body: `Dipendenze: ${Object.keys(dependencies).length}`,
                    thumbnailUrl: "https://emojicdn.elk.sh/📦?style=apple",
                    mediaType: 1,
                    renderLargerThumbnail: false
                }
            }
        }, { quoted: m })

    } catch (e) {
        m.reply('\`𐔌❌꒱\` Errore npm.')
    }
}

handler.help = ['status']
handler.tags = ['tools']
handler.command = /^(status)$/i

export default handler