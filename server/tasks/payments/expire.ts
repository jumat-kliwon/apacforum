import { expireDue } from '../../services/payment'

export default defineTask({
  meta: { name: 'payments:expire', description: 'Tandai tagihan yang lewat batas sebagai kedaluwarsa' },
  async run() {
    return { result: { expired: await expireDue() } }
  }
})
