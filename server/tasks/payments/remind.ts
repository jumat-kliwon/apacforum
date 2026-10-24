import { remindDue } from '../../services/payment'

export default defineTask({
  meta: { name: 'payments:remind', description: 'Send reminders within the last day before the payment deadline' },
  async run() {
    return { result: { reminded: await remindDue() } }
  }
})
