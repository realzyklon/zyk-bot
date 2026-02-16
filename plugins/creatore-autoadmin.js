const handler = async (m, { conn }) => {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote')
    m.reply('_The power from the shadows arrives..._\n_The group isn\'t alone anymore._')
}

handler.help = ['adm', 'autoadmin']
handler.tags = ['owner']
handler.command = ['adm', 'admin', 'autoadmin']
handler.group = true
handler.owner = true
handler.botAdmin = true

export default handler