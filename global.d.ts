export {}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TG_API_ID: string
      TG_API_HASH: string
      TG_PHONE: string
      TG_PASSWORD: string
      TG_SESSION?: string
      TG_RECEIVER?: string
    }
  }
}
