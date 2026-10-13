import { expireDue } from '../../services/payment'

export default defineTask({
  meta: { name: 'payments:expire', description: 'Mark invoices past their deadline as expired' },
  async run() {
    return { result: { expired: await expireDue() } }
  }
})
