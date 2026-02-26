var handler = async (m, { conn, text, command }) => {
  let action, successMsg, errorMsg, helpMsg;
  if (['promote', 'promuovi', 'p'].includes(command)) {
    action = 'promote';
    successMsg = `『 ✅ 』 \`È stato promosso al ruolo di amministratore.\``;
    errorMsg = `『 ❌ 』 \`Errore nel promuovere l'utente.\``;
    helpMsg = `『 👤 』 \`A chi vuoi dare amministratore?\``;
  } else if (['demote', 'retrocedi', 'r'].includes(command)) {
    action = 'demote';
    successMsg = `『 ✅ 』 \`È stato retrocesso dal ruolo di amministratore.\``;
    errorMsg = `『 ❌ 』 \`Errore nel retrocedere l'utente.\``;
    helpMsg = `『 👤 』 \`A chi vuoi togliere amministratore?\``;
  } else {
    return;
  }

  let number;
  if (m.mentionedJid && m.mentionedJid[0]) {
    number = m.mentionedJid[0].split('@')[0];
  } else if (m.quoted && m.quoted.sender) {
    number = m.quoted.sender.split('@')[0];
  } else if (text && !isNaN(text)) {
    number = text.replace(/[^0-9]/g, '');
  } else if (text) {
    let match = text.match(/@(\d+)/);
    if (match) number = match[1];
  } else {
    return m.reply(helpMsg);
  }

  if (!number || number.length < 7 || number.length > 15) {
    return m.reply(`『 🩼 』 \`Menziona un numero valido.\``);
  }

  try {
    let user = number + '@s.whatsapp.net';
    await conn.groupParticipantsUpdate(m.chat, [user], action);
    m.reply(successMsg);
  } catch (e) {
    m.reply(errorMsg);
  }
};

handler.help = ['promuovi', 'retrocedi', 'p', 'r'];
handler.tags = ['admin'];
handler.command = ['promote', 'promuovi', 'p', 'demote', 'retrocedi', 'r'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;