import chalk from 'chalk'
import { formatNum } from './numberfix.js'

let creditsPrinted = false

export default async function (m, conn = {}, isEvent = false) {
  try {
    if (!creditsPrinted) {
      console.log(chalk.blue.dim('\nbot made by @troncarlo • github.com/troncarlo • t.me/troncarlo • MIT LICENSE'))
      creditsPrinted = true
    }

    let time = new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const border = chalk.grey('│')

    const safeGetName = async (id) => {
      try {
        return conn.getName ? await conn.getName(id) : id.split('@')[0]
      } catch {
        return id.split('@')[0]
      }
    }

    if (isEvent) {
      const { id, action } = m
      let groupName = await safeGetName(id)
      let eventCfg = {
        'add': { text: 'MEMBRO ENTRATO', icon: '📥', color: chalk.greenBright },
        'remove': { text: 'MEMBRO USCITO', icon: '📤', color: chalk.redBright },
        'promote': { text: 'NUOVO ADMIN', icon: '⭐', color: chalk.yellowBright },
        'demote': { text: 'ADMIN REVOCATO', icon: '🎖️', color: chalk.red }
      }[action] || { text: `EVENTO: ${action.toUpperCase()}`, icon: '⚙️', color: chalk.white }

      console.log(chalk.cyanBright(`╭───〔 ${chalk.bold(time)} 〕───┈`))
      console.log(`${border} ${eventCfg.color.bold(eventCfg.icon + ' ' + eventCfg.text)}`)
      console.log(`${border} ${chalk.magenta('👥 GRUPPO:')} ${chalk.white(groupName)}`)
      console.log(chalk.cyanBright('╰────────────────────────┈\n'))
      return
    }

    const botJid = conn.user?.id ? conn.decodeJid(conn.user.id) : ''
    const senderJid = m.sender || ''
    
    const userFormatted = formatNum(senderJid)
    const botFormatted = formatNum(botJid)

    const formatRole = (isOwner, isRealAdmin) => {
        if (isOwner) {
            const subRole = isRealAdmin 
                ? chalk.bgYellow.black.bold(' ADMIN ') 
                : chalk.black.bgWhite(' MEMBRO ')
            return chalk.bgRed.white.bold(' OWNER ') + chalk.gray(' | ') + subRole
        }
        if (isRealAdmin) return chalk.bgYellow.black.bold(' ADMIN ')
        return chalk.black.bgWhite(' MEMBRO ')
    }

    const mtype = m.mtype || (m.message ? Object.keys(m.message)[0] : 'unknown')
    const messageContent = m.text || ''
    const isCommand = (messageContent && /^[\\@#&_\-+/?!*.&=]/.test(messageContent))
    const weight = Buffer.byteLength(JSON.stringify(m.message || {}), 'utf8') + ' B'

    console.log(chalk.blueBright(`╭───〔 ${chalk.bold(time)} 〕───┈`))
    
    console.log(`${border} ${chalk.grey('🤖 BOT:')} ${chalk.white(botFormatted)} [${formatRole(false, m.isBotAdmin)}]`)
    
    console.log(`${border} ${chalk.grey('👤 DA :')} ${chalk.bold(m.pushName || 'Utente')} (${chalk.white(userFormatted)}) | ${formatRole(m.isOwner, m.isRealAdmin)}`)
    
    console.log(`${border} ${chalk.grey('📍 CHAT :')} ${m.chat.endsWith('@g.us') ? chalk.yellow(await safeGetName(m.chat)) : chalk.cyan('PRIVATA')}`)
    console.log(`${border} ${chalk.grey('📦 TIPO:')} ${chalk.magenta(mtype.replace('Message', '').toUpperCase())} │ ${chalk.grey('PESO:')} ${chalk.green(weight)}`)

    if (m.quoted) {
      console.log(`${border} ${chalk.grey('↩️  RISPOSTA A:')} ${chalk.white(await safeGetName(m.quoted.sender))}`)
    }

    if (messageContent) {
      console.log(chalk.grey('├─┈'))
      messageContent.split('\n').forEach(line => {
        const icon = isCommand ? chalk.red('⚡') : chalk.blue('💬')
        console.log(`${border} ${icon} ${isCommand ? chalk.yellowBright(line) : chalk.white(line)}`)
      })
    }
    
    console.log(chalk.blueBright('╰────────────────────────┈\n'))

  } catch (e) {
    console.error(chalk.red(`[Print Error]:`), e)
  }
}
