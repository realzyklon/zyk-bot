import fs from 'fs'
const modPath = './media/moderatori.json'

let handler = async (m, { conn }) => {
    const data = JSON.parse(fs.readFileSync(modPath, 'utf-8'))
    let target = m.mentionedJid?.[0] || m.quoted?.sender
    if (!target) return m.reply('_Tagga o quota un utente._')
    target = target.split('@')[0] + '@s.whatsapp.net'
    data.moderatori = data.moderatori.filter(j => j !== target)
    fs.writeFileSync(modPath, JSON.stringify(data, null, 2))
    m.reply(`✅ @${target.split('@')[0]} rimosso dai moderatori.`)
}
handler.command = ['delmod']
handler.owner = true
export default handler