import { remindDue } from '../../services/payment'

export default defineTask({
  meta: { name: 'payments:remind', description: 'Kirim pengingat 24 jam sebelum batas pembayaran' },
  async run() {
    return { result: { reminded: await remindDue() } }
  }
})
