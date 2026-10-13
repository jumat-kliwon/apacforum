/**
 * Vercel Cron entry point. Nitro's `scheduledTasks` only run on a long-lived server,
 * so on Vercel the same tasks are triggered by the crons in `vercel.json`.
 * Vercel sends `Authorization: Bearer $CRON_SECRET`.
 */
const TASKS: Record<string, string[]> = {
  // Hobby plans allow one run per day, so the daily cron runs everything.
  daily: ['payments:expire', 'payments:remind', 'events:notify'],
  expire: ['payments:expire'],
  remind: ['payments:remind'],
  notify: ['events:notify']
}

export default defineEventHandler(async (event) => {
  const secret = process.env.CRON_SECRET
  if (!secret || getHeader(event, 'authorization') !== `Bearer ${secret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
  const tasks = TASKS[getRouterParam(event, 'task') ?? '']
  if (!tasks) throw createError({ statusCode: 404, statusMessage: 'Unknown task' })

  const results: Record<string, unknown> = {}
  for (const name of tasks) {
    results[name] = (await runTask(name)).result
  }
  return results
})
