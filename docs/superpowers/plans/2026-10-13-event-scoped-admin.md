# Event-scoped Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The admin CMS works inside one event at a time. An event switcher in the sidebar picks the event. Dashboard, Registrations, Transactions and Event settings live under `/admin/e/[eventId]/…`. Event management (list, create) moves into the switcher.

**Architecture:** A Nuxt parent route `app/pages/admin/e/[eventId].vue` validates the event, remembers it in a cookie and renders `<NuxtPage />`. The existing admin pages move under it via `git mv` and get their `eventId` from the route. A `useState`-backed event list feeds the sidebar switcher. Server list, export and dashboard endpoints make `eventId` required. Event deletion is blocked while the event has `pending`/`paid`/`refunded` transactions, and a new archive endpoint gives admins the alternative.

**Tech Stack:** Nuxt 4.6 (client-only `/admin/**`), @nuxt/ui 4.11, Drizzle ORM + Postgres, Zod 4, better-auth, Bun, Vitest (new, unit only).

**Spec:** `docs/superpowers/specs/2026-10-13-event-scoped-admin-design.md`

## Global Constraints

- Package manager and runner: **bun** (`bun.lock`). Commands: `bun run typecheck`, `bun run test`, `bun run dev`.
- The CMS is client-only: `routeRules['/admin/**'] = { ssr: false }` in `nuxt.config.ts`. Browser-only APIs and module-level state in admin composables are safe.
- UI copy stays **English**, matching every existing admin screen ("Manage events", "New event", "Event not found").
- In-scope URLs: `/admin/e/[eventId]`, `/admin/e/[eventId]/registrations`, `/admin/e/[eventId]/registrations/[userId]`, `/admin/e/[eventId]/transactions`, `/admin/e/[eventId]/transactions/[id]`, `/admin/e/[eventId]/settings?tab=`, `/admin/e/[eventId]/settings/edit`.
- Global URLs: `/admin` (redirect only), `/admin/events`, `/admin/events/new`, `/admin/email-templates`.
- Old URLs (`/admin/participants*`, `/admin/transactions*`, `/admin/events/[id]*`) are removed **without redirects**.
- Event ids in URLs are UUIDs, never slug or code (both are editable).
- Cookie: name `admin_last_event`, `maxAge` 1 year, `sameSite: 'lax'`.
- Transaction statuses that block event deletion: `pending`, `paid`, `refunded`. Response: **409**.
- No DB schema changes and no migrations.
- Every admin API route keeps calling `requireAdmin(event)` first.
- Do not touch the public scanner (`/scan/**`, `server/api/public/scan/**`).

### Spec amendments made while planning

1. **Archive action is new.** The spec assumed an "Archive" button existed. It does not: the event form only knows `draft`/`published`. Task 2 adds `POST /api/admin/events/[id]/archive`. Editing an archived event and saving it brings it back as draft or published, because `edit.vue` already maps any non-published status to `draft`.
2. **Event list state uses `useState` + an explicit `load(force)`**, not `useFetch` + `refreshNuxtData('admin-events')`. Several components read the list, and `useFetch` instances that share a key interact with dedupe and caching in ways that are easy to get wrong. A plain shared state with an explicit reload is simpler.
3. Switcher labels are English: "Manage events" and "New event". The spec used Indonesian placeholders.

## Review Focus

1. **Stale cookie.** `admin_last_event` points to an event that was deleted. `/admin` must fall back to the newest event, never 404. Covered in Task 3, Step 9.
2. **Missing `eventId` on list/export/dashboard requests.** The API must answer 400. It must never return every event's rows. Covered in Task 4, Step 10 and Task 5, Step 6.
3. **Switching events from a detail page or a filtered list.** The admin must land on the section's main page in the new event, with no stale record id or filter. Covered by unit tests in Task 1.
4. **Newly created or renamed event missing from the switcher.** The list must reload after create, edit, archive and delete. Covered in Task 6, Step 8 and Task 7, Step 6.
5. **Record opened under the wrong event's URL.** Example: a transaction of event B opened at `/admin/e/A/…`. The page must redirect to B's URL and the switcher must show B. Covered in Task 4, Step 10 and Task 5, Step 6.

---

## File map

| File | Responsibility | Task |
|---|---|---|
| `vitest.config.ts`, `package.json` | Unit test runner | 1 |
| `app/utils/adminRoutes.ts` | `eventPath()`, `switchEventPath()`: pure URL builders | 1 |
| `tests/unit/adminRoutes.test.ts` | Unit tests for the above | 1 |
| `server/services/events.ts` | Delete guard, `deleteImpact().transactions`, `archiveEvent()` | 2 |
| `server/api/admin/events/[id]/archive.post.ts` | Archive endpoint | 2 |
| `app/composables/useAdminEvents.ts` | Shared event list, last-event cookie, current event | 3 |
| `app/components/admin/EventSwitcher.vue` | Sidebar dropdown | 3 |
| `app/pages/admin/e/[eventId].vue` | Parent route: validate event, write cookie | 3 |
| `app/pages/admin/index.vue` | Redirect to last/newest event, or empty state | 3 |
| `app/pages/admin/e/[eventId]/index.vue` | Dashboard (moved) | 3 |
| `server/api/admin/dashboard.get.ts` | `eventId` required, single event | 3 |
| `app/layouts/admin.vue` | Sidebar groups + switcher | 3, 4, 5, 6, 7 |
| `app/pages/admin/e/[eventId]/registrations/*` | Registrations list + profile (moved) | 4 |
| `shared/schemas/participant.ts`, `server/services/lists.ts` | `eventId` required, no `event` sort | 4, 5 |
| `server/api/admin/event-options.get.ts` | `?eventId` scopes ticket type names | 4 |
| `server/api/admin/users/[id].get.ts` | Add `eventId` to transactions | 4 |
| `app/components/admin/ParticipantMiniTable.vue` | Profile link inside the event | 4 |
| `app/pages/admin/e/[eventId]/transactions/*` | Transactions list + detail (moved) | 5 |
| `app/pages/admin/e/[eventId]/settings/*` | Event settings + edit (moved) | 6 |
| `server/api/admin/events/[id].get.ts` | Drop `participantBreakdown` | 6 |
| `app/components/admin/EventParticipants.vue` | **Deleted** | 6 |
| `app/components/admin/EventForm.vue` | Cancel link | 6 |
| `app/pages/admin/events/index.vue`, `new.vue` | Global event management | 7 |

**Interim state between tasks:** pages move one section at a time. Between Task 4 and Task 5, links from the old transaction pages to participant profiles 404, and vice versa. Between Task 4 and Task 6, links in `EventParticipants.vue` 404. Each task's own pages work; the final task's checklist covers everything.

---

### Task 1: URL helpers with unit tests

**Files:**
- Modify: `package.json` (scripts + devDependency)
- Create: `vitest.config.ts`
- Create: `app/utils/adminRoutes.ts`
- Test: `tests/unit/adminRoutes.test.ts`

**Interfaces:**
- Produces:
  - `type EventSection = '' | 'registrations' | 'transactions' | 'settings'`
  - `eventPath(eventId: string, section?: EventSection, ...rest: string[]): string`
  - `switchEventPath(path: string, query: Record<string, unknown>, eventId: string): string`
  - Both functions are auto-imported in `app/` because they live in `app/utils/`.

- [ ] **Step 1: Install Vitest and add the script**

Run: `bun add -d vitest`

Then add the script in `package.json` → `"scripts"`, after `"typecheck"`:

```json
    "typecheck": "nuxt typecheck",
    "test": "vitest run",
```

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'

// Unit tests for pure helpers only. They import files directly, without Nuxt auto-imports.
export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node'
  }
})
```

- [ ] **Step 3: Write the failing tests**

Create `tests/unit/adminRoutes.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { eventPath, switchEventPath } from '../../app/utils/adminRoutes'

const A = '0190a0b0-0000-7000-8000-00000000000a'
const B = '0190a0b0-0000-7000-8000-00000000000b'

describe('eventPath', () => {
  it('builds the dashboard path', () => {
    expect(eventPath(A)).toBe(`/admin/e/${A}`)
  })
  it('builds a section path', () => {
    expect(eventPath(A, 'registrations')).toBe(`/admin/e/${A}/registrations`)
  })
  it('builds a record path', () => {
    expect(eventPath(A, 'transactions', 't1')).toBe(`/admin/e/${A}/transactions/t1`)
    expect(eventPath(A, 'settings', 'edit')).toBe(`/admin/e/${A}/settings/edit`)
  })
})

describe('switchEventPath', () => {
  it('keeps the dashboard', () => {
    expect(switchEventPath(`/admin/e/${A}`, {}, B)).toBe(`/admin/e/${B}`)
  })
  it('keeps the section and drops list filters', () => {
    expect(switchEventPath(`/admin/e/${A}/registrations`, { status: 'paid', page: '3' }, B)).toBe(`/admin/e/${B}/registrations`)
  })
  it('drops a record id', () => {
    expect(switchEventPath(`/admin/e/${A}/registrations/u1`, {}, B)).toBe(`/admin/e/${B}/registrations`)
    expect(switchEventPath(`/admin/e/${A}/transactions/t1`, {}, B)).toBe(`/admin/e/${B}/transactions`)
  })
  it('keeps the settings tab', () => {
    expect(switchEventPath(`/admin/e/${A}/settings`, { tab: 'agenda' }, B)).toBe(`/admin/e/${B}/settings?tab=agenda`)
  })
  it('leaves the edit form for settings', () => {
    expect(switchEventPath(`/admin/e/${A}/settings/edit`, {}, B)).toBe(`/admin/e/${B}/settings`)
  })
  it('goes to the dashboard from global pages', () => {
    expect(switchEventPath('/admin/events', {}, B)).toBe(`/admin/e/${B}`)
    expect(switchEventPath('/admin/email-templates', { q: 'x' }, B)).toBe(`/admin/e/${B}`)
    expect(switchEventPath('/admin', {}, B)).toBe(`/admin/e/${B}`)
  })
  it('handles trailing slashes', () => {
    expect(switchEventPath(`/admin/e/${A}/`, {}, B)).toBe(`/admin/e/${B}`)
    expect(switchEventPath(`/admin/e/${A}/transactions/`, {}, B)).toBe(`/admin/e/${B}/transactions`)
  })
  it('treats an unknown section as the dashboard', () => {
    expect(switchEventPath(`/admin/e/${A}/nope`, {}, B)).toBe(`/admin/e/${B}`)
  })
  it('ignores a tab outside settings and a non-string tab', () => {
    expect(switchEventPath(`/admin/e/${A}/registrations`, { tab: 'agenda' }, B)).toBe(`/admin/e/${B}/registrations`)
    expect(switchEventPath(`/admin/e/${A}/settings`, { tab: ['a', 'b'] }, B)).toBe(`/admin/e/${B}/settings`)
  })
  it('encodes the tab', () => {
    expect(switchEventPath(`/admin/e/${A}/settings`, { tab: 'a b&c' }, B)).toBe(`/admin/e/${B}/settings?tab=a%20b%26c`)
  })
})
```

- [ ] **Step 4: Run the tests to verify they fail**

Run: `bun run test`
Expected: FAIL. The import of `../../app/utils/adminRoutes` cannot be resolved.

- [ ] **Step 5: Write the implementation**

Create `app/utils/adminRoutes.ts`:

```ts
/** Sections of the event-scoped CMS under /admin/e/[eventId]. '' is the dashboard. */
export type EventSection = '' | 'registrations' | 'transactions' | 'settings'

const SECTIONS: EventSection[] = ['registrations', 'transactions', 'settings']

/** URL of a page inside an event, e.g. eventPath(id, 'transactions', trxId). */
export function eventPath(eventId: string, section: EventSection = '', ...rest: string[]) {
  return ['/admin/e', eventId, section, ...rest].filter(Boolean).join('/')
}

/**
 * Where the event switcher goes: the same section in the other event, on its main page.
 * Record ids and list filters belong to the old event, so they are dropped. Only the settings tab carries over.
 */
export function switchEventPath(path: string, query: Record<string, unknown>, eventId: string) {
  const segment = /^\/admin\/e\/[^/]+\/([^/]+)/.exec(path)?.[1]
  const section = SECTIONS.find(s => s === segment) ?? ''
  const target = eventPath(eventId, section)
  const tab = section === 'settings' && typeof query.tab === 'string' ? query.tab : undefined
  return tab ? `${target}?tab=${encodeURIComponent(tab)}` : target
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `bun run test`
Expected: PASS, 13 tests.

- [ ] **Step 7: Typecheck**

Run: `bun run typecheck`
Expected: no type errors. The Node version warning and the `ExperimentalWarning` line are pre-existing and fine.

- [ ] **Step 8: Commit**

```bash
git add package.json bun.lock vitest.config.ts app/utils/adminRoutes.ts tests/unit/adminRoutes.test.ts
git commit -m "feat(admin): add event-scoped URL helpers with unit tests"
```

---

### Task 2: Event delete guard and archive endpoint

**Files:**
- Modify: `server/services/events.ts` (imports at line 4; `deleteEvent` at 146–161; `deleteImpact` at 163–171)
- Create: `server/api/admin/events/[id]/archive.post.ts`

**Interfaces:**
- Produces:
  - `deleteImpact(ids)` returns `Map<string, { days, speakers, partners, tickets, participants, transactions: number }>`. `transactions` counts `pending`/`paid`/`refunded` rows.
  - `deleteEvent(id)` throws a 409 when that count is above 0.
  - `archiveEvent(id: string): Promise<void>` sets `status = 'archived'`, or throws a 404.
  - `POST /api/admin/events/:id/archive` → `{ ok: true }`.

- [ ] **Step 1: Import `transactions` in the service**

In `server/services/events.ts`, change line 4:

```ts
import { agendaDays, events, partners, participants, speakers, ticketTypes } from '../db/schema'
```

to:

```ts
import { agendaDays, events, partners, participants, speakers, ticketTypes, transactions } from '../db/schema'
```

Then add this after the `type Actor = { id: string }` line:

```ts
/** Transaction states that hold money or may still receive it. An event with any of these is archived, not deleted. */
const MONEY_STATUSES: ('pending' | 'paid' | 'refunded')[] = ['pending', 'paid', 'refunded']
```

- [ ] **Step 2: Guard `deleteEvent`**

In `deleteEvent`, directly after the `if (!ev) throw …` line and before `const files = [`, insert:

```ts
    // a pending invoice can still be paid through its DOKU link, so it counts as money too
    const [money] = await tx.select({ n: sql<number>`count(*)::int` }).from(transactions)
      .where(and(eq(transactions.eventId, id), inArray(transactions.status, MONEY_STATUSES)))
    if (money && money.n > 0) {
      throw createError({
        statusCode: 409,
        statusMessage: `This event has ${money.n} active or paid ${money.n === 1 ? 'transaction' : 'transactions'}. Archive it instead of deleting.`
      })
    }
```

- [ ] **Step 3: Count blocking transactions in `deleteImpact`**

Replace the whole `deleteImpact` function with:

```ts
/** How much data a delete removes, for the confirmation dialog. `transactions` > 0 means it cannot be deleted. */
export async function deleteImpact(ids: string[]) {
  if (!ids.length) return new Map<string, { days: number, speakers: number, partners: number, tickets: number, participants: number, transactions: number }>()
  const count = (table: typeof agendaDays | typeof speakers | typeof partners | typeof ticketTypes | typeof participants) =>
    db.select({ eventId: table.eventId, n: sql<number>`count(*)::int` }).from(table).where(inArray(table.eventId, ids)).groupBy(table.eventId)
  const [d, s, p, t, pa, tr] = await Promise.all([
    count(agendaDays), count(speakers), count(partners), count(ticketTypes), count(participants),
    db.select({ eventId: transactions.eventId, n: sql<number>`count(*)::int` }).from(transactions)
      .where(and(inArray(transactions.eventId, ids), inArray(transactions.status, MONEY_STATUSES))).groupBy(transactions.eventId)
  ])
  const get = (rows: { eventId: string | null, n: number }[], id: string) => rows.find(r => r.eventId === id)?.n ?? 0
  return new Map(ids.map(id => [id, {
    days: get(d, id), speakers: get(s, id), partners: get(p, id), tickets: get(t, id), participants: get(pa, id), transactions: get(tr, id)
  }]))
}
```

- [ ] **Step 4: Add `archiveEvent`**

Append to `server/services/events.ts`:

```ts
/**
 * Takes an event off the website: public pages and registration only serve `published` events.
 * Editing it later saves it back as a draft or published event.
 */
export async function archiveEvent(id: string) {
  const [ev] = await db.update(events).set({ status: 'archived' }).where(eq(events.id, id)).returning({ id: events.id })
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
}
```

- [ ] **Step 5: Create the endpoint**

Create `server/api/admin/events/[id]/archive.post.ts`:

```ts
import { archiveEvent } from '~~/server/services/events'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  await archiveEvent(parseId(event))
  return { ok: true }
})
```

- [ ] **Step 6: Typecheck**

Run: `bun run typecheck`
Expected: no type errors.

- [ ] **Step 7: Verify against the dev database**

1. Run `bun run dev`, sign in as admin at `http://localhost:3000/login`.
2. Find one event **with** blocking transactions and one **without**. Use `bun run db:studio` → `transactions` table, or SQL: `select event_id, status, count(*) from transactions group by 1, 2;`. If no event lacks them, create a draft event through `/admin/events/new` first.
3. In the browser devtools console on any `/admin` page, run:
   - `fetch('/api/admin/events/<EVENT_WITH_PAID_ID>', { method: 'DELETE' }).then(async r => [r.status, await r.json()])`
     Expected: `[409, { statusMessage: 'This event has N active or paid transactions. Archive it instead of deleting.', … }]`
   - `fetch('/api/admin/events/<EVENT_WITH_PAID_ID>/archive', { method: 'POST' }).then(r => r.status)`
     Expected: `200`. In db:studio, the event's `status` is now `archived`.
   - `fetch('/api/admin/events/00000000-0000-7000-8000-000000000000/archive', { method: 'POST' }).then(r => r.status)`
     Expected: `404`.
4. Restore the archived event by setting `status` back to `published` in db:studio, so later tasks have data.

- [ ] **Step 8: Commit**

```bash
git add server/services/events.ts "server/api/admin/events/[id]/archive.post.ts"
git commit -m "feat(admin): block deleting events with money transactions; add archive endpoint"
```

---

### Task 3: Event shell: state, parent route, switcher, dashboard

**Files:**
- Create: `app/composables/useAdminEvents.ts`
- Create: `app/components/admin/EventSwitcher.vue`
- Create: `app/pages/admin/e/[eventId].vue`
- Move: `app/pages/admin/index.vue` → `app/pages/admin/e/[eventId]/index.vue`
- Create (new file at the old path): `app/pages/admin/index.vue`
- Modify: `server/api/admin/dashboard.get.ts`
- Modify: `app/layouts/admin.vue`

**Interfaces:**
- Consumes: `eventPath`, `switchEventPath` (Task 1).
- Produces:
  - `type AdminEventOption = { id: string, name: string, status: 'draft' | 'published' | 'archived' }`
  - `useAdminEvents(): { events: Ref<AdminEventOption[] | null>, load(force?: boolean): Promise<AdminEventOption[]> }`
  - `useLastEventId(): CookieRef<string | null>`
  - `useCurrentEvent(): { id: ComputedRef<string | null>, event: ComputedRef<AdminEventOption | null> }`
  - `useEventId(): string`: the `eventId` route param. Only call it in pages under `/admin/e/[eventId]`; those remount when the event changes.
  - `GET /api/admin/dashboard?eventId=<uuid>` (required). The response no longer has `events` or `eventId`.

- [ ] **Step 1: Create the composable**

Create `app/composables/useAdminEvents.ts`:

```ts
export type AdminEventOption = { id: string, name: string, status: 'draft' | 'published' | 'archived' }

/**
 * Every event, newest first, for the event switcher and the event routes.
 * Loaded once. Call `load(true)` after an event is created, edited, archived or deleted.
 */
export function useAdminEvents() {
  const events = useState<AdminEventOption[] | null>('admin-events', () => null)
  async function load(force = false) {
    if (events.value && !force) return events.value
    const res = await $fetch('/api/admin/event-options')
    events.value = res.events
    return res.events
  }
  return { events, load }
}

/** The event the admin opened last, so /admin can go straight back to it. */
export function useLastEventId() {
  return useCookie<string | null>('admin_last_event', { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', default: () => null })
}

/** The event the admin is working in: the one in the URL under /admin/e/[eventId], else the last one opened. */
export function useCurrentEvent() {
  const route = useRoute()
  const last = useLastEventId()
  const { events } = useAdminEvents()
  const id = computed(() => (typeof route.params.eventId === 'string' ? route.params.eventId : last.value) ?? null)
  const event = computed(() => events.value?.find(e => e.id === id.value) ?? null)
  return { id, event }
}

/** Event id of a page under /admin/e/[eventId]. Those pages remount when the event changes, so a plain string is enough. */
export function useEventId() {
  return String(useRoute().params.eventId)
}
```

- [ ] **Step 2: Create the parent route**

Create `app/pages/admin/e/[eventId].vue`:

```vue
<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
  // a malformed id is a 404 before anything loads
  validate: route => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(route.params.eventId))
})

const route = useRoute()
const { load } = useAdminEvents()
const last = useLastEventId()

/** Every page below needs an existing event; remember it so /admin opens it next time. */
async function enter(id: string) {
  const events = await load()
  if (!events.some(e => e.id === id)) throw createError({ statusCode: 404, statusMessage: 'Event not found', fatal: true })
  last.value = id
}

await enter(String(route.params.eventId))
watch(() => route.params.eventId, id => enter(String(id)).catch(showError))
</script>

<template>
  <NuxtPage />
</template>
```

- [ ] **Step 3: Move the dashboard and create the `/admin` redirect**

```bash
mkdir -p "app/pages/admin/e/[eventId]"
git mv app/pages/admin/index.vue "app/pages/admin/e/[eventId]/index.vue"
```

Create a new `app/pages/admin/index.vue`:

```vue
<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })

// /admin has no content of its own: open the last event, else the newest one (the list is newest first)
const events = await useAdminEvents().load()
const last = useLastEventId()
const target = events.find(e => e.id === last.value) ?? events[0]
if (target) await navigateTo(eventPath(target.id), { replace: true })
</script>

<template>
  <AdminPageHeader title="Dashboard" />
  <div class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-calendar-plus" title="No events yet" description="Create the first event to start taking registrations." :actions="[{ label: 'Add event', to: '/admin/events/new', icon: 'i-lucide-plus' }]" />
  </div>
</template>
```

- [ ] **Step 4: Make the dashboard API take one required event**

In `server/api/admin/dashboard.get.ts`, replace everything from `const query = …` through the `if (!ev) return { … }` line (lines 6–19) with:

```ts
const query = z.object({ eventId: z.uuid() })

export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { eventId } = parseQuery(event, query)

  const [ev] = await db.select({ id: events.id, timezone: events.timezone }).from(events).where(eq(events.id, eventId))
  if (!ev) throw createError({ statusCode: 404, statusMessage: 'Event not found' })
```

Then in the `return { … }` at the end, delete the two lines:

```ts
    events: evs,
    eventId: ev.id,
```

- [ ] **Step 5: Point the dashboard page at the current event**

In `app/pages/admin/e/[eventId]/index.vue`, replace lines 4–9:

```ts
const eventId = ref<string | undefined>()
const { data, status } = await useFetch('/api/admin/dashboard', { query: { eventId }, watch: [eventId] })
watch(data, (d) => { if (d?.eventId && !eventId.value) eventId.value = d.eventId }, { immediate: true })

const eventItems = computed(() => (data.value?.events ?? []).map(e => ({ label: e.name, value: e.id })))
const eventName = computed(() => data.value?.events.find(e => e.id === data.value?.eventId)?.name ?? '')
```

with:

```ts
const eventId = useEventId()
const { event } = useCurrentEvent()
const { data } = await useFetch('/api/admin/dashboard', { query: { eventId } })

const eventName = computed(() => event.value?.name ?? '')
```

In the template, delete the actions slot that holds the event select:

```vue
    <template #actions>
      <USelect v-model="eventId" :items="eventItems" icon="i-lucide-calendar-days" aria-label="Choose an event" class="min-w-56" />
    </template>
```

Replace the empty-state block and its `v-else` opener:

```vue
  <div v-if="!data?.stats && status !== 'pending'" class="rounded-md border border-default bg-default p-10">
    <UEmpty icon="i-lucide-calendar-plus" title="No events yet" description="Create the first event to start taking registrations." :actions="[{ label: 'Add event', to: '/admin/events/new', icon: 'i-lucide-plus' }]" />
  </div>

  <template v-else>
```

with:

```vue
  <template v-if="data">
```

Leave the "See all participants" button (`/admin/participants?eventId=`) unchanged for now. Task 4 updates it.

- [ ] **Step 6: Create the switcher**

Create `app/components/admin/EventSwitcher.vue`:

```vue
<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import type { AdminEventOption } from '~/composables/useAdminEvents'

const route = useRoute()
const { events } = useAdminEvents()
const { event: current } = useCurrentEvent()

const items = computed<DropdownMenuItem[][]>(() => [
  (events.value ?? []).map(e => ({
    label: e.name,
    icon: e.id === current.value?.id ? 'i-lucide-check' : 'i-lucide-calendar-days',
    status: e.status,
    onSelect: () => navigateTo(switchEventPath(route.path, route.query, e.id))
  })),
  [
    { label: 'Manage events', icon: 'i-lucide-settings-2', to: '/admin/events' },
    { label: 'New event', icon: 'i-lucide-plus', to: '/admin/events/new' }
  ]
])
</script>

<template>
  <UDropdownMenu :items="items" :content="{ align: 'start' }" :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) max-h-96' }">
    <UButton
      color="neutral"
      variant="outline"
      block
      trailing-icon="i-lucide-chevrons-up-down"
      class="h-auto justify-between px-3 py-2"
      :aria-label="current ? `Event: ${current.name}. Switch event` : 'Choose an event'"
    >
      <span class="flex min-w-0 flex-col items-start gap-1">
        <span class="w-full truncate text-left text-sm font-semibold text-highlighted">{{ current?.name ?? 'Choose an event' }}</span>
        <UBadge v-if="current" v-bind="EVENT_STATUS[current.status]" size="sm" />
      </span>
    </UButton>

    <template #item-trailing="{ item }">
      <UBadge v-if="item.status" v-bind="EVENT_STATUS[item.status as AdminEventOption['status']]" size="sm" />
    </template>
  </UDropdownMenu>
</template>
```

- [ ] **Step 7: Update the sidebar**

In `app/layouts/admin.vue`, replace the `items` constant (lines 7–13) with:

```ts
const { load } = useAdminEvents()
const { event: current } = useCurrentEvent()
load()

// links follow the event in the URL, or the last one opened when on a global page
const eventItems = computed<NavigationMenuItem[]>(() => {
  const id = current.value?.id
  if (!id) return []
  return [
    { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: eventPath(id), exact: true },
    { label: 'Registrations', icon: 'i-lucide-users', to: '/admin/participants' },
    { label: 'Transactions', icon: 'i-lucide-credit-card', to: '/admin/transactions' }
  ]
})
const workspaceItems: NavigationMenuItem[] = [
  { label: 'Events', icon: 'i-lucide-calendar-days', to: '/admin/events' },
  { label: 'Email templates', icon: 'i-lucide-mail', to: '/admin/email-templates' }
]
```

In the template, replace the section label and the single `UNavigationMenu` (the `<!-- Core Menu Tree … -->` comment through the closing `/>` of `UNavigationMenu`) with:

```vue
      <div class="px-1 pt-3">
        <AdminEventSwitcher />
      </div>

      <!-- Core Menu Tree: section label 16/12/4, items 40px tall with 8/12 padding, 2px apart -->
      <template v-if="eventItems.length">
        <p class="px-3 pt-4 pb-1 text-[11px]/4 font-medium uppercase tracking-[1.1px] text-muted">
          Event
        </p>
        <UNavigationMenu
          :items="eventItems"
          orientation="vertical"
          :ui="{
            list: 'flex flex-col gap-0.5',
            link: 'min-h-10 px-3 py-2 gap-3 text-sm/5 before:inset-0 before:rounded-sm'
          }"
        />
      </template>
      <p class="px-3 pt-4 pb-1 text-[11px]/4 font-medium uppercase tracking-[1.1px] text-muted">
        Workspace
      </p>
      <UNavigationMenu
        :items="workspaceItems"
        orientation="vertical"
        :ui="{
          list: 'flex flex-col gap-0.5',
          link: 'min-h-10 px-3 py-2 gap-3 text-sm/5 before:inset-0 before:rounded-sm'
        }"
      />
```

Registrations and Transactions still point to the old pages. Tasks 4 and 5 switch them. "Events" stays in Workspace until Task 7.

- [ ] **Step 8: Typecheck**

Run: `bun run typecheck`
Expected: no type errors. If `item.status` in the `#item-trailing` slot is typed `any`, the `as` cast is enough. If it is typed `never`, change the slot binding to `{ item }: { item: DropdownMenuItem & { status?: AdminEventOption['status'] } }`.

- [ ] **Step 9: Verify in the browser**

With `bun run dev` signed in as admin:
1. Clear the `admin_last_event` cookie (devtools → Application → Cookies). Open `/admin`. It lands on `/admin/e/<newest event>` and the dashboard shows that event's stats. The switcher shows its name and status badge.
2. Open the switcher. Every event is listed with a status badge and ✓ on the current one, plus "Manage events" and "New event". Pick another event: the URL changes and the stats change.
3. Open `/admin` again. It returns to the event picked last.
4. Set the cookie to `00000000-0000-7000-8000-000000000000` and open `/admin`. It lands on the newest event, not a 404.
5. Open `/admin/e/not-a-uuid` and `/admin/e/00000000-0000-7000-8000-000000000000`. Both show the 404 page, whose button returns to `/admin`.
6. Open `/admin/events`. The switcher and the Event group still show the last event, and its Dashboard link works.
7. In the console: `fetch('/api/admin/dashboard').then(r => r.status)` → `400`.
8. At a narrow width (<1024px), open the sidebar drawer. The switcher works, and the drawer closes after picking an event.

- [ ] **Step 10: Commit**

```bash
git add app/composables/useAdminEvents.ts app/components/admin/EventSwitcher.vue "app/pages/admin/e" app/pages/admin/index.vue app/layouts/admin.vue server/api/admin/dashboard.get.ts
git commit -m "feat(admin): event switcher, event parent route and per-event dashboard"
```

---

### Task 4: Registrations under the event

**Files:**
- Modify: `shared/schemas/participant.ts:33-41`
- Modify: `server/services/lists.ts:11-19, 27`
- Modify: `server/api/admin/event-options.get.ts`
- Modify: `server/api/admin/users/[id].get.ts` (transactions select)
- Move: `app/pages/admin/participants/index.vue` → `app/pages/admin/e/[eventId]/registrations/index.vue`
- Move: `app/pages/admin/participants/[id].vue` → `app/pages/admin/e/[eventId]/registrations/[userId].vue`
- Modify: `app/components/admin/ParticipantMiniTable.vue`
- Modify: `app/pages/admin/e/[eventId]/index.vue` ("See all participants")
- Modify: `app/layouts/admin.vue` (Registrations link)

**Interfaces:**
- Consumes: `eventPath`, `useEventId`.
- Produces:
  - `participantListQuery.eventId: string` (required). Sort enum without `'event'`.
  - `GET /api/admin/event-options?eventId=` → `{ events, ticketTypeNames }`, with names scoped to that event when the param is given.
  - `GET /api/admin/users/:id` → each `transactions[]` row gains `eventId: string | null`.

- [ ] **Step 1: Require `eventId` in the participant list query**

In `shared/schemas/participant.ts`, inside `participantListQuery`, change:

```ts
  eventId: z.uuid().optional(),
```

to:

```ts
  eventId: z.uuid(),
```

and change its sort line:

```ts
  sort: z.enum(['name', 'type', 'event', 'org', 'reg', 'pay', 'date']).default('date')
```

to:

```ts
  sort: z.enum(['name', 'type', 'org', 'reg', 'pay', 'date']).default('date')
```

- [ ] **Step 2: Update the participant list service**

In `server/services/lists.ts`, delete `event: events.name,` from `participantSort` (line 14). In `participantWhere`, change:

```ts
  if (q.eventId) conds.push(eq(participants.eventId, q.eventId))
```

to:

```ts
  conds.push(eq(participants.eventId, q.eventId))
```

- [ ] **Step 3: Scope ticket type names to the event**

Replace `server/api/admin/event-options.get.ts` with:

```ts
import { asc, desc, eq } from 'drizzle-orm'
import * as z from 'zod'
import { db } from '~~/server/db'
import { events, ticketTypes } from '~~/server/db/schema'

const query = z.object({ eventId: z.uuid().optional() })

/** Every event (for the event switcher) and ticket type names (for filters; only one event's when `eventId` is given). */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { eventId } = parseQuery(event, query)
  const [evs, tts] = await Promise.all([
    db.select({ id: events.id, name: events.name, status: events.status }).from(events).orderBy(desc(events.startDate)),
    db.select({ name: ticketTypes.name }).from(ticketTypes)
      .where(eventId ? eq(ticketTypes.eventId, eventId) : undefined)
      .groupBy(ticketTypes.name).orderBy(asc(ticketTypes.name))
  ])
  return { events: evs, ticketTypeNames: tts.map(t => t.name) }
})
```

- [ ] **Step 4: Return each transaction's event id on the profile API**

In `server/api/admin/users/[id].get.ts`, in the transactions select, change:

```ts
      id: transactions.id, invoiceNo: transactions.invoiceNo, eventName: transactions.eventName, total: transactions.total,
```

to:

```ts
      id: transactions.id, invoiceNo: transactions.invoiceNo, eventId: transactions.eventId, eventName: transactions.eventName, total: transactions.total,
```

- [ ] **Step 5: Move the pages**

```bash
mkdir -p "app/pages/admin/e/[eventId]/registrations"
git mv app/pages/admin/participants/index.vue "app/pages/admin/e/[eventId]/registrations/index.vue"
git mv "app/pages/admin/participants/[id].vue" "app/pages/admin/e/[eventId]/registrations/[userId].vue"
```

- [ ] **Step 6: Scope the registrations list**

In `app/pages/admin/e/[eventId]/registrations/index.vue`:

a. Replace the `useListQuery` call, the destructure and both `useFetch` lines (lines 8–16) with:

```ts
const eventId = useEventId()
const list = useListQuery({
  sort: 'date',
  dir: 'desc',
  filters: { ticketTypeName: undefined, status: undefined, paymentStatus: undefined } as Record<'ticketTypeName' | 'status' | 'paymentStatus', string | undefined>
})
const { q, page, pageSize, filters, query, sortHeader } = list
const apiQuery = computed(() => ({ ...query.value, eventId }))

const { data, status, refresh } = await useFetch('/api/admin/participants', { query: apiQuery })
const { data: options } = await useFetch('/api/admin/event-options', { query: { eventId } })
```

b. Delete these two lines:

```ts
const eventItems = computed(() => withAll('All events', (options.value?.events ?? []).map(e => ({ label: e.name, value: e.id }))))
```

```ts
const fEvent = pick('eventId')
```

c. Delete the Event column:

```ts
  { id: 'event', header: sortHeader('event', 'Event'), meta: { label: 'Event' } },
```

d. In `exportUrl`, change:

```ts
  const params = new URLSearchParams(Object.entries(query.value).map(([k, v]) => [k, String(v)]))
```

to:

```ts
  const params = new URLSearchParams(Object.entries(apiQuery.value).map(([k, v]) => [k, String(v)]))
```

e. In the template, delete the Event filter field:

```vue
      <UFormField label="Event">
        <USelect v-model="fEvent" :items="eventItems" class="w-full" />
      </UFormField>
```

and the event cell:

```vue
      <template #event-cell="{ row }">
        {{ row.original.eventName }}
      </template>
```

f. Replace both profile links, `` :to="`/admin/participants/${row.original.userId}`" `` (in `#name-cell` and in `#actions-cell`), with:

```vue
:to="eventPath(eventId, 'registrations', row.original.userId)"
```

- [ ] **Step 7: Scope the participant profile**

In `app/pages/admin/e/[eventId]/registrations/[userId].vue`:

a. Replace lines 8–13:

```ts
const route = useRoute()
const notify = useNotify()
const id = computed(() => String(route.params.id))
const { data, error, refresh } = await useFetch(() => `/api/admin/users/${id.value}`)

const user = computed(() => data.value?.user)
const latestType = computed(() => data.value?.registrations[0]?.ticketTypeName)
```

with:

```ts
const route = useRoute()
const notify = useNotify()
const eventId = useEventId()
const id = computed(() => String(route.params.userId))
const { data, error, refresh } = await useFetch(() => `/api/admin/users/${id.value}`)

const user = computed(() => data.value?.user)
const here = computed(() => data.value?.registrations.filter(r => r.eventId === eventId) ?? [])
const elsewhere = computed(() => data.value?.registrations.filter(r => r.eventId !== eventId) ?? [])
const latestType = computed(() => here.value[0]?.ticketTypeName)

// the URL's event must be one they registered for; otherwise open their latest registration's event
const latest = data.value?.registrations[0]
if (latest && !here.value.length) await navigateTo(eventPath(latest.eventId, 'registrations', id.value), { replace: true })
```

b. Change the tickets computed to only this event's:

```ts
const tickets = computed(() => data.value?.registrations.filter(r => r.ticketCode && r.ticketQr) ?? [])
```

→

```ts
const tickets = computed(() => here.value.filter(r => r.ticketCode && r.ticketQr))
```

c. In `sendEmail`, change `const reg = data.value?.registrations[0]` to `const reg = here.value[0]`.

d. In `remove()`, change `await navigateTo('/admin/participants')` to `await navigateTo(eventPath(eventId, 'registrations'))`.

e. Template, not-found state: change `:actions="[{ label: 'Back to participants', to: '/admin/participants' }]"` to `:actions="[{ label: 'Back to participants', to: eventPath(eventId, 'registrations') }]"`.

f. Template, header: change `:breadcrumb="[{ label: 'Participants', to: '/admin/participants' }, { label: user.name }]"` to `:breadcrumb="[{ label: 'Participants', to: eventPath(eventId, 'registrations') }, { label: user.name }]"`. Change the "Send email" button's `:disabled="!data.registrations.length"` to `:disabled="!here.length"`.

g. Replace the "Registered events" panel: from `<AdminPanel title="Registered events">` through its closing `</AdminPanel>`. Keep the inner cells for reg no, statuses and actions exactly as they are. Change the panel opener and actions to:

```vue
        <AdminPanel title="Registration">
          <template #actions>
            <span class="text-[13px] text-muted">{{ here[0]?.eventName }}</span>
          </template>
          <UTable
            :data="here"
```

In that table's `#event-cell`, replace the `NuxtLink` to `/admin/events/…` with plain text:

```vue
            <template #event-cell="{ row }">
              <span class="font-semibold text-highlighted">{{ row.original.eventName }}</span>
              <div class="text-xs text-muted">
                {{ formatDateRange(row.original.startDate, row.original.endDate, 'short') }} · {{ row.original.ticketTypeName }}
              </div>
            </template>
```

h. Directly after the E-tickets panel (`<AdminPanel v-if="tickets.length" …>…</AdminPanel>`), add:

```vue
        <AdminPanel v-if="elsewhere.length" title="Other events" description="Open a registration to manage it in its own event.">
          <UTable
            :data="elsewhere"
            :columns="[{ id: 'event', header: 'Event' }, { id: 'no', header: 'Registration no.' }, { id: 'reg', header: 'Registration status' }, { id: 'pay', header: 'Payment status' }]"
            class="-mx-4 sm:-mx-5"
          >
            <template #event-cell="{ row }">
              <NuxtLink :to="eventPath(row.original.eventId, 'registrations', id)" class="font-semibold text-highlighted hover:underline">
                {{ row.original.eventName }}
              </NuxtLink>
              <div class="text-xs text-muted">
                {{ formatDateRange(row.original.startDate, row.original.endDate, 'short') }} · {{ row.original.ticketTypeName }}
              </div>
            </template>
            <template #no-cell="{ row }">
              <span class="font-mono text-[13px]">{{ row.original.regNo }}</span>
            </template>
            <template #reg-cell="{ row }">
              <UBadge v-bind="REGISTRATION_STATUS[row.original.status]" />
            </template>
            <template #pay-cell="{ row }">
              <UBadge v-bind="paymentStatusLabel(row.original.paymentStatus, row.original.status)" />
            </template>
          </UTable>
        </AdminPanel>
```

i. In the "Transaction history" table, replace the `#id-cell` and `#actions-cell` templates with:

```vue
            <template #id-cell="{ row }">
              <NuxtLink v-if="row.original.eventId" :to="eventPath(row.original.eventId, 'transactions', row.original.id)" class="font-mono text-[13px] font-medium text-primary hover:underline">
                {{ row.original.invoiceNo }}
              </NuxtLink>
              <span v-else class="font-mono text-[13px] font-medium">{{ row.original.invoiceNo }}</span>
            </template>
```

```vue
            <template #actions-cell="{ row }">
              <UButton v-if="row.original.eventId" :to="eventPath(row.original.eventId, 'transactions', row.original.id)" size="sm" color="neutral" variant="ghost" label="Details" />
            </template>
```

- [ ] **Step 8: Update the remaining links to registrations**

`app/components/admin/ParticipantMiniTable.vue`: add `const eventId = useEventId()` after `defineProps…`, and change `` :to="`/admin/participants/${row.original.userId}`" `` to `:to="eventPath(eventId, 'registrations', row.original.userId)"`.

`app/pages/admin/e/[eventId]/index.vue`: change `:to="{ path: '/admin/participants', query: { eventId } }"` to `:to="eventPath(eventId, 'registrations')"`.

`app/layouts/admin.vue`: in `eventItems`, change the Registrations entry's `to: '/admin/participants'` to `to: eventPath(id, 'registrations')`.

- [ ] **Step 9: Typecheck**

Run: `bun run typecheck`
Expected: no type errors.

- [ ] **Step 10: Verify in the browser**

1. In the sidebar, Registrations opens `/admin/e/<id>/registrations`. The rows are only this event's. The table has no Event column and no Event filter.
2. Open the Participant type filter. It lists only this event's ticket types.
3. Apply a status filter, then switch event in the switcher. You land on the other event's Registrations page with no filter.
4. Export CSV. The file only has this event's rows.
5. Console: `fetch('/api/admin/participants').then(r => r.status)` → `400`. Also `fetch('/api/admin/exports/participants').then(r => r.status)` → `400`.
6. Open a profile. "Registration" shows this event's row and its e-ticket. "Other events" lists the rest, if any. Clicking one opens the same profile under that event, and the switcher follows.
7. Open the profile of a user registered only in event B, using event A's URL: `/admin/e/<A>/registrations/<userId>`. You are redirected to `/admin/e/<B>/registrations/<userId>`.
8. The dashboard's "See all participants" and its latest-registrations rows open pages under the event.

- [ ] **Step 11: Commit**

```bash
git add -A shared/schemas/participant.ts server/services/lists.ts server/api/admin/event-options.get.ts "server/api/admin/users/[id].get.ts" app/pages/admin app/components/admin/ParticipantMiniTable.vue app/layouts/admin.vue
git commit -m "feat(admin): move registrations under the selected event"
```

---

### Task 5: Transactions under the event

**Files:**
- Modify: `shared/schemas/participant.ts` (`transactionListQuery`)
- Modify: `server/services/lists.ts` (`transactionSort`, `transactionWhere`)
- Move: `app/pages/admin/transactions/index.vue` → `app/pages/admin/e/[eventId]/transactions/index.vue`
- Move: `app/pages/admin/transactions/[id].vue` → `app/pages/admin/e/[eventId]/transactions/[id].vue`
- Modify: `app/layouts/admin.vue` (Transactions link)

**Interfaces:**
- Consumes: `eventPath`, `useEventId`. `GET /api/admin/transactions/:id` already returns `event: { id, … } | null`.
- Produces: `transactionListQuery.eventId: string` (required). Sort enum without `'event'`.

- [ ] **Step 1: Require `eventId` in the transaction list query**

In `shared/schemas/participant.ts`, inside `transactionListQuery`, change `eventId: z.uuid().optional(),` to `eventId: z.uuid(),`. Change:

```ts
  sort: z.enum(['id', 'name', 'type', 'event', 'amount', 'method', 'status', 'date']).default('date')
```

to:

```ts
  sort: z.enum(['id', 'name', 'type', 'amount', 'method', 'status', 'date']).default('date')
```

- [ ] **Step 2: Update the transaction list service**

In `server/services/lists.ts`, delete `event: transactions.eventName,` from `transactionSort`. In `transactionWhere`, change:

```ts
  if (q.eventId) conds.push(eq(transactions.eventId, q.eventId))
```

to:

```ts
  conds.push(eq(transactions.eventId, q.eventId))
```

- [ ] **Step 3: Move the pages**

```bash
mkdir -p "app/pages/admin/e/[eventId]/transactions"
git mv app/pages/admin/transactions/index.vue "app/pages/admin/e/[eventId]/transactions/index.vue"
git mv "app/pages/admin/transactions/[id].vue" "app/pages/admin/e/[eventId]/transactions/[id].vue"
```

- [ ] **Step 4: Scope the transactions list**

In `app/pages/admin/e/[eventId]/transactions/index.vue`:

a. Replace lines 7–15 (`useListQuery` through the `event-options` fetch) with:

```ts
const eventId = useEventId()
const list = useListQuery({
  sort: 'date',
  dir: 'desc',
  filters: { status: undefined, method: undefined, from: undefined, to: undefined } as Record<'status' | 'method' | 'from' | 'to', string | undefined>
})
const { q, page, pageSize, filters, query, sortHeader } = list
const apiQuery = computed(() => ({ ...query.value, eventId }))

const { data, status } = await useFetch('/api/admin/transactions', { query: apiQuery })
```

b. Delete `const eventItems = computed(…)` and `const fEvent = pick('eventId')`. Change the `pick` signature from `(key: 'status' | 'eventId' | 'method')` to `(key: 'status' | 'method')`.

c. Delete the column `{ id: 'event', header: sortHeader('event', 'Event'), meta: { label: 'Event' } },`.

d. In `exportUrl`, change `Object.entries(query.value)` to `Object.entries(apiQuery.value)`.

e. Template: delete the Event filter `<UFormField label="Event">…</UFormField>` and the `#event-cell` template.

f. Template links:
- Both `` :to="`/admin/transactions/${row.original.id}`" `` (in `#id-cell` and `#actions-cell`) become `:to="eventPath(eventId, 'transactions', row.original.id)"`.
- `` :to="`/admin/participants/${row.original.userId}`" `` becomes `:to="eventPath(eventId, 'registrations', row.original.userId)"`.

- [ ] **Step 5: Scope the transaction detail**

In `app/pages/admin/e/[eventId]/transactions/[id].vue`:

a. After the `useFetch` line (line 8), add:

```ts
const eventId = useEventId()
// a transaction is shown under its own event; one whose event was deleted has no page
if (data.value) {
  if (!data.value.event) throw createError({ statusCode: 404, statusMessage: 'Transaction not found', fatal: true })
  if (data.value.event.id !== eventId) await navigateTo(eventPath(data.value.event.id, 'transactions', id.value), { replace: true })
}
```

b. Template replacements:
- `:actions="[{ label: 'Back to transactions', to: '/admin/transactions' }]"` → `:actions="[{ label: 'Back to transactions', to: eventPath(eventId, 'transactions') }]"`
- `:breadcrumb="[{ label: 'Transactions', to: '/admin/transactions' }, { label: trx.invoiceNo }]"` → `:breadcrumb="[{ label: 'Transactions', to: eventPath(eventId, 'transactions') }, { label: trx.invoiceNo }]"`
- Both `` :to="`/admin/participants/${data.user.id}`" `` (the name link and the "View participant profile" button) → `:to="eventPath(eventId, 'registrations', data.user.id)"`
- `` :to="`/admin/events/${data.event.id}`" `` → `:to="eventPath(data.event.id, 'settings')"`

- [ ] **Step 6: Point the sidebar at the new page, then verify**

`app/layouts/admin.vue`: in `eventItems`, change `to: '/admin/transactions'` to `to: eventPath(id, 'transactions')`.

Run: `bun run typecheck`. Expected: no type errors.

In the browser:
1. Transactions shows only this event's rows and summary cards, with no Event column or filter. Export CSV contains only this event.
2. Console: `fetch('/api/admin/transactions').then(r => r.status)` → `400`. Also `fetch('/api/admin/exports/transactions').then(r => r.status)` → `400`.
3. Copy a transaction id from event B and open `/admin/e/<A>/transactions/<thatId>`. You are redirected to event B's URL, and the switcher shows B.
4. From a transaction, "View participant profile" opens the profile under the same event. From the profile's transaction history, "Details" opens the transaction.
5. Switch event while on a transaction detail. You land on the other event's Transactions list.

- [ ] **Step 7: Commit**

```bash
git add -A shared/schemas/participant.ts server/services/lists.ts app/pages/admin app/layouts/admin.vue
git commit -m "feat(admin): move transactions under the selected event"
```

---

### Task 6: Event settings under the event (delete guard + archive UI)

**Files:**
- Move: `app/pages/admin/events/[id]/index.vue` → `app/pages/admin/e/[eventId]/settings/index.vue`
- Move: `app/pages/admin/events/[id]/edit.vue` → `app/pages/admin/e/[eventId]/settings/edit.vue`
- Delete: `app/components/admin/EventParticipants.vue`
- Modify: `server/api/admin/events/[id].get.ts` (drop breakdown)
- Modify: `app/components/admin/EventForm.vue:387` (Cancel link)
- Modify: `app/layouts/admin.vue` (Event settings link)

**Interfaces:**
- Consumes: `eventPath`, `useEventId`, `useAdminEvents().load`. From Task 2: `impact.transactions` and `POST /api/admin/events/:id/archive`.
- Produces: `GET /api/admin/events/:id` no longer returns `participantBreakdown`.

- [ ] **Step 1: Move the pages and delete the participants tab component**

```bash
mkdir -p "app/pages/admin/e/[eventId]/settings"
git mv "app/pages/admin/events/[id]/index.vue" "app/pages/admin/e/[eventId]/settings/index.vue"
git mv "app/pages/admin/events/[id]/edit.vue" "app/pages/admin/e/[eventId]/settings/edit.vue"
git rm app/components/admin/EventParticipants.vue
```

- [ ] **Step 2: Drop the participant breakdown from the event API**

In `server/api/admin/events/[id].get.ts`:
- Change the destructure `const [days, sp, pa, tickets, sold, [stats], [revenue], breakdown, impact] = await Promise.all([` to `const [days, sp, pa, tickets, sold, [stats], [revenue], impact] = await Promise.all([`.
- Delete the comment `// registration × payment status counts for the Participants tab filters` and the two lines of the query below it (the `db.select({ status: participants.status, paymentStatus: … })…groupBy(…)` entry).
- Delete `participantBreakdown: breakdown,` from the response.

- [ ] **Step 3: Settings page: id, tabs, links**

In `app/pages/admin/e/[eventId]/settings/index.vue`:

a. Change `const id = String(route.params.id)` to `const id = useEventId()`, and add `const { load } = useAdminEvents()` on the next line.

b. In `tabs`, delete the Participants entry:

```ts
    { label: 'Participants', value: 'participants', icon: 'i-lucide-users', badge: count(d?.stats.participants), slot: 'participants' as const },
```

c. In the template, delete the participants tab slot:

```vue
      <template #participants>
        <AdminEventParticipants :event-id="id" :capacity="ev.capacity" :registered="data.stats.participants" :breakdown="data.participantBreakdown" />
      </template>
```

d. Change `` :to="`/admin/events/${id}/edit`" `` to `:to="eventPath(id, 'settings', 'edit')"`.

e. In `impactText`, change the people line:

```ts
  const people = i.participants ? `${plural(i.participants, 'participant loses their', 'participants lose their')} e-tickets; transactions are kept. ` : ''
```

to:

```ts
  const people = i.participants ? `${plural(i.participants, 'participant loses their', 'participants lose their')} e-tickets. ` : ''
```

- [ ] **Step 4: Settings page: delete guard and archive**

a. Replace `remove()` with:

```ts
async function remove() {
  deleting.value = true
  try {
    await $fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
    notify.success('Event deleted')
    await load(true)
    await navigateTo('/admin/events')
  } catch (err) {
    notify.error(err)
    deleting.value = false
  }
}

// events with money on them are archived instead (the server refuses to delete them)
const locked = computed(() => (data.value?.impact.transactions ?? 0) > 0)
const archiving = ref(false)
async function archive() {
  archiving.value = true
  try {
    await $fetch(`/api/admin/events/${id}/archive`, { method: 'POST' })
    notify.success('Event archived', 'It is no longer on the website.')
    await Promise.all([load(true), refresh()])
  } catch (err) {
    notify.error(err)
  } finally {
    archiving.value = false
  }
}
```

and change `const { data, error } = await useFetch(…)` to `const { data, error, refresh } = await useFetch(…)`.

b. In the header actions, replace:

```vue
        <UButton color="error" variant="ghost" icon="i-lucide-trash-2" label="Delete" @click="deleteOpen = true" />
```

with:

```vue
        <UTooltip v-if="locked" :text="`${formatNumber(data.impact.transactions)} pending, paid or refunded transactions keep this event. Archive it instead.`">
          <UButton color="error" variant="ghost" icon="i-lucide-trash-2" label="Delete" disabled />
        </UTooltip>
        <UButton v-else color="error" variant="ghost" icon="i-lucide-trash-2" label="Delete" @click="deleteOpen = true" />
        <UButton v-if="ev.status !== 'archived'" color="neutral" variant="ghost" icon="i-lucide-archive" label="Archive" :loading="archiving" @click="archive" />
```

- [ ] **Step 5: Edit page**

In `app/pages/admin/e/[eventId]/settings/edit.vue`:
- Change `const id = String(route.params.id)` to `const id = useEventId()`.
- In `update()`, replace `await navigateTo(`/admin/events/${id}`)` with:

```ts
    await useAdminEvents().load(true)
    await navigateTo(eventPath(id, 'settings'))
```

- In the breadcrumb, change `` { label: data.event.name, to: `/admin/events/${id}` } `` to `{ label: data.event.name, to: eventPath(id, 'settings') }`.

In `app/components/admin/EventForm.vue:387`, change:

```vue
        <UButton :to="eventId ? `/admin/events/${eventId}` : '/admin/events'" color="neutral" variant="ghost" label="Cancel" />
```

to:

```vue
        <UButton :to="eventId ? eventPath(eventId, 'settings') : '/admin/events'" color="neutral" variant="ghost" label="Cancel" />
```

- [ ] **Step 6: Sidebar**

In `app/layouts/admin.vue`, append to the `eventItems` array:

```ts
    { label: 'Event settings', icon: 'i-lucide-settings', to: eventPath(id, 'settings') }
```

- [ ] **Step 7: Typecheck**

Run: `bun run typecheck`
Expected: no type errors. `grep -rn "AdminEventParticipants\|participantBreakdown" app server` prints nothing.

- [ ] **Step 8: Verify in the browser**

1. "Event settings" in the sidebar opens `/admin/e/<id>/settings`. The tabs are Overview, Agenda, Speakers, Partners and Tickets; there is no Participants tab. Pick Agenda, switch event, and the Agenda tab stays open.
2. For an event with a paid transaction, Delete is disabled and its tooltip explains why. Archive works: a toast appears, the status badge on the page and in the switcher becomes Archived, and the event disappears from the public `/events` list.
3. Edit the archived event and save it as published. It is back on the website, and the switcher badge updates without a page reload.
4. Rename an event through Edit. The switcher shows the new name right after saving.
5. For an event with only expired transactions or none (create a draft if needed), delete it. You land on `/admin/events` and the event is gone from the switcher. Then open `/admin`: the stale cookie falls back to the newest event.
6. "Ticket scanner" still opens the modal with the scanner link.

- [ ] **Step 9: Commit**

```bash
git add -A app/pages/admin app/components/admin server/api/admin/events app/layouts/admin.vue
git commit -m "feat(admin): move event settings under the selected event; archive instead of delete"
```

---

### Task 7: Global event management and final sidebar

**Files:**
- Modify: `app/pages/admin/events/index.vue`
- Modify: `app/pages/admin/events/new.vue`
- Modify: `app/layouts/admin.vue`

**Interfaces:**
- Consumes: `eventPath`, `useAdminEvents`, `impact.transactions`, the archive endpoint.

- [ ] **Step 1: Event list links**

In `app/pages/admin/events/index.vue`, template:
- `` :to="`/admin/events/${row.original.id}`" `` (name link and View button) → `:to="eventPath(row.original.id, 'settings')"`
- `` :to="`/admin/events/${row.original.id}/edit`" `` → `:to="eventPath(row.original.id, 'settings', 'edit')"`

- [ ] **Step 2: Event list: delete guard, archive, reload the switcher**

a. In `<script setup>`, after `const notify = useNotify()`, add `const { load } = useAdminEvents()`.

b. In `remove()`, change `await refresh()` to `await Promise.all([refresh(), load(true)])`.

c. Add after `remove()`:

```ts
const archivingId = ref<string | null>(null)
async function archive(r: Row) {
  archivingId.value = r.id
  try {
    await $fetch(`/api/admin/events/${r.id}/archive`, { method: 'POST' })
    notify.success(`${r.name} archived`)
    await Promise.all([refresh(), load(true)])
  } catch (err) {
    notify.error(err)
  } finally {
    archivingId.value = null
  }
}
```

d. In `impactText`, change the people line to drop "transactions are kept":

```ts
  const people = i.participants ? `${plural(i.participants, 'registration and its', 'registrations and their')} e-tickets are deleted. ` : ''
```

e. In `#actions-cell`, replace the delete button:

```vue
          <UButton size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Delete ${row.original.name}`" @click="target = row.original" />
```

with:

```vue
          <UButton
            v-if="row.original.status !== 'archived' && row.original.impact.transactions > 0"
            size="sm"
            color="neutral"
            variant="ghost"
            icon="i-lucide-archive"
            :loading="archivingId === row.original.id"
            :aria-label="`Archive ${row.original.name}`"
            @click="archive(row.original)"
          />
          <UTooltip v-if="row.original.impact.transactions > 0" :text="`${formatNumber(row.original.impact.transactions)} pending, paid or refunded transactions keep this event. Archive it instead.`">
            <UButton size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Delete ${row.original.name} (not possible)`" disabled />
          </UTooltip>
          <UButton v-else size="sm" color="error" variant="ghost" icon="i-lucide-trash-2" :aria-label="`Delete ${row.original.name}`" @click="target = row.original" />
```

f. Change the page header to fit its new place:

```vue
  <AdminPageHeader title="Events" description="Each event has its own details, agenda, speakers, partners and tickets.">
```

→

```vue
  <AdminPageHeader title="Manage events" description="Every event. Open one to work in it, or use the switcher in the sidebar.">
```

- [ ] **Step 3: New event goes to its settings**

In `app/pages/admin/events/new.vue`, replace `await navigateTo(`/admin/events/${id}`)` with:

```ts
    await useAdminEvents().load(true)
    await navigateTo(eventPath(id, 'settings'))
```

Change the breadcrumb `{ label: 'Events', to: '/admin/events' }` to `{ label: 'Manage events', to: '/admin/events' }`.

- [ ] **Step 4: Final sidebar**

In `app/layouts/admin.vue`:

a. Change `const { load } = useAdminEvents()` to `const { events, load } = useAdminEvents()`.

b. Remove the interim Events entry from `workspaceItems`, so it is:

```ts
const workspaceItems: NavigationMenuItem[] = [
  { label: 'Email templates', icon: 'i-lucide-mail', to: '/admin/email-templates' }
]
```

c. Replace the switcher wrapper:

```vue
      <div class="px-1 pt-3">
        <AdminEventSwitcher />
      </div>
```

with:

```vue
      <div class="px-1 pt-3">
        <!-- no events yet: nothing to switch between -->
        <UButton v-if="events && !events.length" to="/admin/events/new" icon="i-lucide-plus" label="Create the first event" block />
        <AdminEventSwitcher v-else />
      </div>
```

- [ ] **Step 5: Confirm the old page folders are gone**

Run: `ls app/pages/admin`
Expected: `e  email-templates.vue  events  index.vue`. `app/pages/admin/events` contains only `index.vue  new.vue`. If empty `participants/` or `transactions/` folders remain, delete them with `rmdir`.

Run: `grep -rnE "/admin/(participants|transactions)|/admin/events/\\$\\{" app`
Expected: no output.

- [ ] **Step 6: Typecheck, unit tests, full manual checklist**

Run: `bun run typecheck && bun run test`
Expected: no type errors; 13 tests pass.

Then go through the spec's checklist (§8) in the browser:
1. `/admin` without a cookie opens the newest event. Pick another event, open `/admin` again, and it opens the last one.
2. Switch event from Registrations with a filter. You land on the new event's Registrations page with no filter.
3. Switch event from settings `?tab=agenda`. The Agenda tab of the new event opens.
4. `/admin/e/{A}/transactions/{B's trx}` redirects to B, and the switcher shows B.
5. A profile of a user registered only in B, opened via A's URL, redirects to B.
6. Two tabs on different events each stay consistent: navigate in one, then the other, and check the switcher label in both.
7. A random UUID at `/admin/e/{uuid}` gives a 404 page that leads back to `/admin`.
8. Both exports contain only the active event.
9. The Participant type filter only offers the active event's types.
10. An event with a paid transaction has Delete disabled in both the list and settings. A direct API call gets 409.
11. An event with only expired transactions can be deleted. The switcher refreshes and `/admin` still works.
12. With no events in the database (use a scratch DB, or skip and note it), the sidebar shows only "Create the first event" and Email templates.
13. Create a new event. You are redirected to its settings, and it appears in the switcher.
14. Mobile sidebar drawer: the switcher works and the drawer closes after navigating.

- [ ] **Step 7: Commit**

```bash
git add -A app/pages/admin app/layouts/admin.vue
git commit -m "feat(admin): manage events from the switcher; drop the Events menu"
```
