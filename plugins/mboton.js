import pkg from '@realvare/baileys'
const { generateWAMessageFromContent, proto } = pkg

const handler = async (m, { conn, usedPrefix }) => {
    const siteUrl = 'https://dichiarare.netlify.app'

    const msg = generateWAMessageFromContent(
        m.chat,
        {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({
                            text: 'Seleziona una delle opzioni disponibili qui sotto.'
                        }),
                        footer: proto.Message.InteractiveMessage.Footer.create({
                            text: '📦 zyklon system'
                        }),
                        header: proto.Message.InteractiveMessage.Header.create({
                            title: '『 🌐 』 TEST INTERACTIVE',
                            hasMediaAttachment: false
                        }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    name: 'cta_url',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: 'Apri WebView 🖥️',
                                        url: siteUrl,
                                        merchant_url: siteUrl
                                    })
                                },
                                {
                                    name: 'quick_reply',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: 'Menu RPG 🎮',
                                        id: `${usedPrefix}livello`
                                    })
                                },
                                {
                                    name: 'cta_copy',
                                    buttonParamsJson: JSON.stringify({
                                        display_text: 'Copia Link 📋',
                                        copy_code: siteUrl
                                    })
                                }
                            ]
                        })
                    })
                }
            }
        },
        { quoted: m }
    )

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.help = ['mboton']
handler.tags = ['owner']
handler.command = /^(mboton|testbutton)$/i

export default handler