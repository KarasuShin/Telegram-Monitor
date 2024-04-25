import { karasu } from '@karasushin/eslint-config'

export default [
  ...karasu({
    typescript: true,
    react: false,
  }),
]
