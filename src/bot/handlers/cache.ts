import { Composer } from '../composer'
import { __ } from '../i18n'

const composer = new Composer()

export default composer

composer.command(['cache', 'caches'], ctx => {
  ctx.session.admins = []
  ctx.session.search = undefined
  ctx.session.loop = false
  return ctx.reply(__('caches_deleted'))
})

composer.filter(
  (
    ctx
  ): ctx is typeof ctx & {
    chatMember: NonNullable<typeof ctx['chatMember']>
  } => {
    return !!ctx.chatMember
  },
  ctx => {
    const chat = ctx.chatMember.chat.id
    const member = ctx.chatMember.new_chat_member

    if (ctx.session.admins.length == 0) {
      return
    }

    if (
      (member.status == 'creator' ||
        (member.status == 'administrator' && member.can_manage_voice_chats)) &&
      !member.is_anonymous
    ) {
      if (!ctx.session.admins.includes(member.user.id)) {
        ctx.session.admins.push(member.user.id)
      }
    } else if (ctx.session.admins.includes(member.user.id)) {
      delete ctx.session.admins[ctx.session.admins.indexOf(member.user.id)]
    }
  }
)
