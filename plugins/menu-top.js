let handler = async (m, { conn, usedPrefix }) => {
    const buttons = [
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '💬 TOP MESSAGGI (GLOBALE)',
                id: `${usedPrefix}topmessaggi`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '👥 TOP MESSAGGI (GRUPPO)',
                id: `${usedPrefix}topmsgc`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '💰 TOP DENARO (GLOBALE)',
                id: `${usedPrefix}topeuro`
            })
        },
        {
            name: 'quick_reply',
            buttonParamsJson: JSON.stringify({
                display_text: '🏛️ TOP DENARO (GRUPPO)',
                id: `${usedPrefix}topeurgc`
            })
        }
    ]

    const interactiveMessage = {
        viewOnceMessage: {
            message: {
                interactiveMessage: {
                    header: { title: '', hasMediaAttachment: false },
                    body: { text: "*Seleziona la classifica che desideri visualizzare:*" },
                    footer: { text: "" },
                    nativeFlowMessage: {
                        buttons: buttons,
                        messageParamsJson: ''
                    }
                }
            }
        }
    }

    await conn.relayMessage(m.chat, interactiveMessage, {})
}

handler.command = ['top']
handler.group = true

export default handler