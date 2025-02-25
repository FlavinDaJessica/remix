import { Composer } from '../composer'
import controls from './controls'
import playlist from './playlist'
import search from './search'
import stream from './stream'
import cache from './cache'
import panel from './panel'
import now from './now'

const composer = new Composer()

export default composer

composer
  .on('message')
  .filter(ctx => !!(ctx.chat || ctx.chatMember?.chat)?.type.includes('group'))
  .use(stream)
  .use(playlist)
  .use(now)
  .use(search)

composer
  .filter(async ctx => {
    if (!ctx.chat?.type.includes('group') || !ctx.from) {
      return false
    }

    const chatId = ctx.chat.id

    if (ctx.session.admins.length == 0) {
      const members = (await ctx.api.getChatAdministrators(chatId)).filter(
        member =>
          (member.status == 'creator' ||
            (member.status == 'administrator' &&
              member.can_manage_voice_chats)) &&
          !member.is_anonymous
      )

      ctx.session.admins = []

      for (const member of members) {
        ctx.session.admins.push(member.user.id)
      }
    }

    return ctx.session.admins.includes(ctx.from.id)
  })
  .use(panel)
  .use(cache)
  .on('message')
  .use(controls)
