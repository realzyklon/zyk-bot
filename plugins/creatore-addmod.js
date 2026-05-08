const modPath = './media/moderatori.json'
import fs from 'fs'

function getMods() {
    try { return JSON.parse(fs.readFileSync(modPath, 'utf-8')) } 
    catch { return { moderatori: [] } }
}
function saveMods(data) {
    fs.writeFileSync(modPath, JSON.stringify(data, null, 2))
}

let handler = async (m, { conn, args, isGroup }) => {
    const data = getMods()
    let target = m.mentionedJid?.[0] || (m.quoted?.sender)
    if (!target) return m.reply('_Tagga o quota un utente._')
    target = target.split('@')[0] + '@s.whatsapp.net'
    if (data.moderatori.includes(target)) return m.reply('_Già moderatore._')
    data.moderatori.push(target)
    saveMods(data)
    m.reply(`✅ @${target.split('@')[0]} aggiunto come moderatore.`)
}
handler.command = ['addmod']
handler.owner = true
export default handler