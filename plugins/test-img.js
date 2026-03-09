import pkg from '@realvare/baileys'
const { generateWAMessageFromContent } = pkg

const handler = async (m, { conn }) => {
    // URL dell'immagine che vuoi mostrare
    const imageUrl = 'https://telegra.ph/file/your-image-id.jpg' 

    const msg = generateWAMessageFromContent(m.chat, {
        viewOnceMessage: {
            message: {
                buttonsMessage: {
                    imageMessage: await conn.prepareWAMessageMedia({ image: { url: imageUrl } }, { upload: conn.waUploadToServer }),
                    contentText: "se va sborro forte",
                    footerText: "by giuse⁶⁷",
                    buttons: [
                        { buttonId: "btn1", buttonText: { displayText: "bottone1" }, type: 1 },
                        { buttonId: "btn2", buttonText: { displayText: "botton2" }, type: 1 }
                    ],
                    headerType: "IMAGE", // Cambiato da LOCATION a IMAGE
                    contextInfo: {
                        isForwarded: true,
                        forwardingScore: 1,
                        // Qui puoi ancora inserire le coordinate se vuoi che appaiano nei metadati
                        locationMessage: {
                            degreesLatitude: 0,
                            degreesLongitude: 0,
                            name: 'Zyklon System Location'
                        }
                    }
                }
            }
        }
    }, { quoted: m })

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.command = /^(testimg)$/i

export default handler