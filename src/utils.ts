import type { Api, TelegramClient } from 'telegram'
import type { Entity } from 'telegram/define'

export function getEntityInfo(client: TelegramClient, entity: Api.TypeEntityLike): Promise<Entity>
export function getEntityInfo(client: TelegramClient, entity: Api.TypeEntityLike[]): Promise<Entity[]>
export async function getEntityInfo(client: TelegramClient, entity: Api.TypeEntityLike | Api.TypeEntityLike[]) {
  if (Array.isArray(entity)) {
    return await Promise.all(entity.map(item => getEntityInfo(client, item)))
  }
  try {
    const result = await client.getEntity(entity)
    return result
  } catch {
    return null
  }
}
