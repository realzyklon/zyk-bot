import pkg from '@realvare/baileys'
const { generateWAMessageFromContent } = pkg
import axios from 'axios'

const handler = async (m, { conn }) => {
    try {
        const imgUrl = 'https://github.com/troncarlo.png'
        const response = await axios.get(imgUrl, { responseType: 'arraybuffer' })
        const buffer = Buffer.from(response.data, 'utf-8')

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    buttonsMessage: {
                        locationMessage: {
                            degreesLatitude: 0,
                            degreesLongitude: 0,
                            name: 'troncarlo', // Nome corto per non allargare il box
                            jpegThumbnail: buffer,
                            isSingleWidget: true // Tenta di forzare il widget compatto
                        },
                        contentText: "se va sborro forte",
                        footerText: "by giuse⁶⁷",
                        buttons: [
                            { buttonId: "btn1", buttonText: { displayText: "bottone1" }, type: 1 },
                            { buttonId: "btn2", buttonText: { displayText: "bottone2" }, type: 1 }
                        ],
                        headerType: 6
                    }
                }
            }
        }, { quoted: m })

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
    } catch (e) {
        console.error(e)
    }
}

handler.command = /^(testloc2)$/i

export default handler