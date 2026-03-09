let handler = async (m, { conn }) => {
    const siteUrl = 'https://dichiarare.netlify.app'
    
    const msg = {
        interactiveMessage: {
            body: { 
                text: `╭┈  『 🌐 』 *WEBVIEW TEST*\n┆\n┆ Clicca il link qui sotto. Se il tuo client lo supporta, si aprirà nel popup interno.\n┆\n╰┈➤ ${siteUrl}` 
            },
            footer: { 
                text: '📦 zyklon system' 
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "APRI IN-APP 🖥️",
                            url: siteUrl,
                            webview_presentation: "QUERY_PARAM" // Forza il rendering interno
                        })
                    }
                ]
            }
        }
    }

    await conn.relayMessage(m.chat, {
        viewOnceMessage: {
            message: msg
        }
    }, { quoted: m })
}

handler.command = /^(wvtest)$/i
export default handler