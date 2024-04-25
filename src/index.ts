/* eslint-disable no-console */
import dotenv from 'dotenv'
import type { Api } from 'telegram'
import { TelegramClient } from 'telegram'
import { NewMessage } from 'telegram/events'
import type { NewMessageEvent } from 'telegram/events'
import { StringSession } from 'telegram/sessions'
import * as prompts from '@clack/prompts'
import dayjs from 'dayjs'
import { getEntityInfo } from './utils'

dotenv.config()

const chats = ['karasutest_group', 'karasutest_channel', 'me']

const { TG_API_ID, TG_API_HASH, TG_PASSWORD, TG_PHONE, TG_SESSION } = process.env

if (!TG_API_ID || !TG_API_HASH || !TG_PHONE || !TG_PASSWORD) {
  console.error('Please provide all required environment variables')
  process.exit(1)
}

const session = new StringSession(TG_SESSION)

async function main() {
  const client = new TelegramClient(session, Number(TG_API_ID), TG_API_HASH, {
    connectionRetries: 5,
  })

  await client.start({
    phoneNumber: TG_PHONE,
    password: () => TG_PASSWORD as unknown as Promise<string>,
    phoneCode: async () => await prompts.text({
      message: 'Please enter the code you received:',
    }) as string,
    onError: err => {
      console.error(err.message)
    },
  })

  prompts.log.info('You should now be connected.')

  client.session.save()

  const channelList = await getEntityInfo(client, chats)

  const validChannels: {
    [id: string]: {
      title: string
    }
  } = {}

  for (const channel of channelList) {
    if (channel) {
      switch (channel.className) {
        case 'Channel': {
          validChannels[channel.id.toString()] = {
            title: channel.title,
          }

          break
        }
        case 'User':
          validChannels[channel.id.toString()] = {
            title: [channel.firstName, channel.lastName].join(' '),
          }
          break
        default:
      }
    }
  }

  client.addEventHandler((event: NewMessageEvent) => {
    const { peerId } = event.message
    console.log(peerId.className)
    let fromEntityId: Api.long | null = null
    switch (peerId.className) {
      case 'PeerUser':
        fromEntityId = peerId.userId
        break
      case 'PeerChannel':
        fromEntityId = peerId.channelId
        break
      default:
    }

    if (!fromEntityId) {
      return
    }

    const from = validChannels[fromEntityId.toString()]
    const datetime = dayjs(event.message.date * 1e3).format('YYYY-MM-DD HH:mm:ss')

    console.log(`Message from ${from.title}[${datetime}]: ${event.message.message}`)
  }, new NewMessage({
    chats: Object.keys(validChannels),
  }))
}

await main()
