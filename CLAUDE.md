# Broiler Management — Development Rules

Nuxt 4 + Vue 3 + Pinia + Firebase + Tailwind CSS. These rules apply to **all** code in this
repository. When a rule conflicts with a quick shortcut, follow the rule.

---

## 1. Stack & versions

- Always use the **latest stable** releases of Nuxt, Vue, Pinia (`@pinia/nuxt`), and the Firebase
  modular SDK (`firebase` v9+ tree-shakable API — never the `compat` API).
- TypeScript everywhere (`<script setup lang="ts">`, `.ts` files). No `any` unless unavoidable and
  commented with the reason.
- Follow the official [Vue Style Guide](https://vuejs.org/style-guide/) (priority A and B rules are
  mandatory) and [Nuxt conventions](https://nuxt.com/docs/guide/directory-structure).
- Composition API only. No Options API, no mixins.
- Rely on Nuxt auto-imports (`ref`, `computed`, composables, components, stores); don't add
  redundant imports for them.

## 2. Project structure (Nuxt 4 `app/` dir)

```
app/
  assets/css/         # global CSS only (main.css)
  components/
    ui/               # Base* design-system primitives (BaseButton, BaseInput, ...)
    layout/           # App shell pieces (AppShell, AppHeader, AppSidebar)
    charts/           # chart wrappers
    <feature>/        # feature components (dashboard/, flocks/, ...)
  composables/        # useXxx — all reusable logic
  layouts/            # Nuxt layouts
  middleware/         # route guards (auth.ts, guest.ts, role.ts)
  pages/              # routes — thin, composition only
  plugins/            # firebase.client.ts, etc.
  services/
    network.ts        # THE central request wrapper (see §5)
    <domain>.service.ts  # Firestore/Auth/Storage/HTTP calls per domain
  stores/             # Pinia stores (useXxxStore)
  types/              # shared TypeScript types/interfaces
  utils/              # pure, stateless helpers (formatters, validators)
  constants/          # enums, collection names, config constants
server/               # Nuxt server routes (only for trusted/secret logic)
firestore.rules       # Firestore security rules (version-controlled)
storage.rules         # Storage security rules (version-controlled)
```

## 3. Layering — who may call what

```
Page / Component  →  Composable  →  Pinia Store  →  Service  →  network.ts  →  Firebase / HTTP
```

- **Pages** compose components and call composables. No business logic, no direct store
  mutation, no Firebase imports.
- **Components** are presentational where possible: props in, events out. Logic goes in
  composables.
- **Composables** (`useXxx`) hold all logic: form handling, derived state, orchestration of
  stores. They are the only thing components talk to for data.
- **Stores** (Pinia) hold shared/global state and call **services**.
- **Services** are the only files that import from `firebase/*` or call `$fetch`, and every call
  goes through `network.ts`.
- Never skip a layer upward (e.g. a component importing a service or `firebase/firestore`).

## 4. State management (Pinia)

- Use **setup stores** (`defineStore('flocks', () => { ... })`), one store per domain, file
  `app/stores/flocks.ts`, exported as `useFlocksStore`.
- State: `ref`; getters: `computed`; actions: functions. Return only what consumers need.
- Each async action tracks its status with the shared `RequestStatus` type (see §5) — do not
  invent per-store `isLoading` booleans.
- Use `storeToRefs()` when destructuring state in composables/components.
- Local, component-only state stays in the component/composable — not every `ref` belongs in a
  store.
- Stores must be SSR-safe: no `window`/`localStorage` access at store creation time.

## 5. Central network layer — `app/services/network.ts`

**Every** Firebase or HTTP call goes through this single file. Nothing else catches raw
Firebase/HTTP errors.

Responsibilities:
- Wrap an async operation and **return a Promise** of a typed, normalized result.
- Normalize all errors (FirebaseError codes, HTTP status codes, network/offline, timeouts) into
  one `AppError` shape with a user-friendly `message` and a stable `code`.
- Map Firebase codes to messages in one place (e.g. `permission-denied`, `not-found`,
  `unauthenticated`, `auth/invalid-credential`, `unavailable`).
- Handle cross-cutting concerns: auth expiry → sign-out + redirect, optional toast
  notification, dev-only logging. Never log sensitive data.

Shared types (in `app/types/network.ts`):

```ts
export type RequestStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AppError {
  code: string        // stable machine code, e.g. 'permission-denied'
  message: string     // safe, user-facing message
  cause?: unknown     // original error, for dev logging only
}

export type Result<T> = { data: T; error: null } | { data: null; error: AppError }
```

Usage pattern:

```ts
// services/flocks.service.ts
export const fetchFlocks = (farmId: string) =>
  request(() => getDocs(query(collection(db, COLLECTIONS.flocks), where('farmId', '==', farmId))))
```

- Services return the promise from `request()`; they don't catch errors themselves.
- Stores/composables read `result.error` and set `status` to `'error'`; UI renders states from
  `status` — never from try/catch scattered in components.
- A reusable `useAsyncState`-style composable may wrap `request()` to expose
  `{ data, status, error, execute }` for component-local calls. Use it instead of re-writing
  loading/error refs.

## 6. Error & status handling in the UI

Every data-driven view must handle all four states:
- `loading` → `BaseSkeleton` / `BaseSpinner`
- `error` → `BaseAlert` with the `AppError.message` and a retry action where it makes sense
- `success` with no data → `BaseEmptyState`
- `success` with data → content

Forms: disable submit + show `loading` on `BaseButton` while pending, show field-level validation
errors, never lose user input on failure. Use a Nuxt `error.vue` page for fatal/route errors.

## 7. Firebase & security

- Initialize Firebase **once** in `app/plugins/firebase.client.ts`, config from
  `runtimeConfig.public` (env vars `NUXT_PUBLIC_FIREBASE_*`). Never hard-code config or commit
  `.env`.
- Secrets (service accounts, admin SDK, third-party API keys) live **only** in server code
  (`server/`) or Cloud Functions — never in client bundles.
- Collection names come from `app/constants/collections.ts` — no string literals scattered around.
- **Security rules are mandatory and version-controlled** (`firestore.rules`, `storage.rules`):
  - Default **deny all**; open access explicitly per collection.
  - Require `request.auth != null` for all non-public data.
  - Enforce ownership/tenancy (e.g. `resource.data.farmId` belongs to the user) and roles via
    custom claims or a trusted users/roles doc — never trust role fields the client writes.
  - Validate writes: required fields, types, allowed keys (`keys().hasOnly([...])`), value ranges,
    server timestamps (`request.time`), and immutable fields on update.
  - Storage: restrict by path ownership, content type, and file size.
  - Any new collection or field ships **with** its rule changes in the same change.
  - Test rules with the Firebase Emulator Suite before deploying.
- Client-side validation is for UX only; the rules are the real enforcement.
- Route protection via Nuxt middleware (`auth`, `guest`, role-based) — but treat it as UX, not
  security.

## 8. Design system & styling

- **Tailwind only**, using the tokens in `tailwind.config.ts`. Don't use arbitrary hex values or
  inline styles when a token exists:
  - Colors: `primary-*` (brand yellow), `accent-{blue,green,purple,yellow,red}`,
    `surface`, `surface-light`, `surface-dark`, `surface-dark-elevated`, Tailwind `slate-*` for
    neutrals.
  - Radius `rounded-xl/2xl/3xl`, shadows `shadow-soft/card/popover`, animations
    `animate-fade-in/slide-up/slide-in-right/shimmer`, font `Plus Jakarta Sans`.
  - New tokens go in `tailwind.config.ts`, never ad-hoc.
- **Dark mode** (`darkMode: 'class'`, managed by `useTheme`): every surface, text, border and
  hover state needs a `dark:` counterpart.
- **Mobile-first & responsive**: write base classes for small screens, then add `sm:`/`md:`/`lg:`/
  `xl:`. No horizontal scrolling at 320px width. Touch targets ≥ 40px. Tables must collapse or
  scroll inside their container on mobile.
- **Reuse UI primitives**: always use the `components/ui/Base*` components (`BaseButton`,
  `BaseInput`, `BaseCard`, `BaseModal`, `BaseTable`, `BaseAlert`, ...) instead of styling raw
  elements. If a pattern appears twice, extract a component.
- **Page sections:** a page with more than one section (stats, lists, reports, ...) wraps each
  one in `layout/PageSection`, alternating `tone="base"` / `tone="raised"` so neighbours get a
  full-width contrasting band. Mark the band after `PageHeader` `first` and the final band `last`.
  Don't space sections with ad-hoc `mb-*`/`space-y-*`.
- Use `@lucide/vue` for icons.
- Accessibility: semantic HTML, labels for inputs, `aria-*` on custom controls, visible focus
  rings, sufficient contrast in both themes.
- Use `@apply` only in `main.css` for global base styles, not as a substitute for components.

## 9. No duplication (DRY)

- Logic used in more than one place → composable (stateful) or `utils/` (pure function).
- UI used in more than one place → component.
- Types defined once in `app/types/`; constants once in `app/constants/`.
- Before writing something new, check `composables/`, `utils/`, and `components/ui/` for an
  existing solution and extend it rather than copying it.

## 10. Naming conventions

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase, multi-word | `FlockCard.vue`, `BaseButton.vue` |
| Base/UI primitives | `Base` prefix | `BaseModal.vue` |
| Layout singletons | `App` prefix | `AppHeader.vue` |
| Composables | `useCamelCase` | `useFlockForm.ts` |
| Stores | file `flocks.ts`, export `useFlocksStore` | |
| Services | `<domain>.service.ts`, verb-first functions | `fetchFlocks`, `createFlock` |
| Types/interfaces | PascalCase, no `I` prefix | `Flock`, `AppError` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_FLOCK_SIZE` |
| Pages/routes | kebab-case | `pages/flocks/[id].vue` |
| Booleans | `is/has/can/should` prefix | `isOpen`, `hasError` |
| Event handlers | `handle`/`on` prefix | `handleSubmit` |
| Emitted events | kebab-case in templates, camelCase in `defineEmits` | |

## 11. Component conventions

- Order inside SFCs: `<script setup lang="ts">` → `<template>` → `<style>` (rare).
- Typed `defineProps<{...}>()` with `withDefaults`, typed `defineEmits<{...}>()`, `defineModel()`
  for v-model.
- Never mutate props. Keep templates simple — move complex expressions to `computed`.
- Always `:key` with `v-for` (stable ids, not indexes). Never `v-if` with `v-for` on the same
  element.
- Keep components small and focused (~200 lines max as a guideline); split when they grow.
- Use `<ClientOnly>` / `import.meta.client` for browser-only code (charts, localStorage).

## 12. Comments & code quality

- Each composable, store, service and non-trivial util has a short JSDoc block describing its
  purpose, params, and return value.
- Comment **why**, not what. Explain business rules (e.g. mortality %, FCR calculations), edge
  cases, and workarounds.
- No commented-out code, no stray `console.log` (dev logging only via `network.ts`).
- Prefer early returns, small pure functions, and descriptive names over clever code.
- Remove unused code, imports, and files as part of the change that makes them unused.

## 13. Pagination

Every list that can grow over time (flocks, batches, feed logs, mortality records, sales, users,
activity) **must be paginated**. Never fetch a whole collection to show part of it.

- **Cursor-based only.** Use Firestore `orderBy()` + `limit()` + `startAfter(lastDoc)`. Never use
  offset-style pagination: Firestore bills you for skipped docs, and offset is unstable when data
  changes.
- **One shared composable:** `app/composables/usePagination.ts` handles all paging: cursors, page
  size, `hasMore`, `status`, `error`, `loadMore()`, `reset()`, and optionally `next()`/`prev()`.
  Feature code never re-implements cursor tracking.
- **Services accept and return cursors:** a paged service takes `{ pageSize, cursor, filters,
  sort }` and returns `{ items, nextCursor, hasMore }` through `request()` (see §5). Fetch
  `pageSize + 1` docs to work out `hasMore` without an extra read.
- **Deterministic ordering:** every paged query has an explicit `orderBy`. Add a tie-breaker on
  document id (`orderBy(documentId())`) when the main sort field isn't unique. Each filter + sort
  combination needs its composite index declared in `firestore.indexes.json`.
- **Page size:** default `PAGE_SIZE = 20` in `app/constants/pagination.ts`, maximum `100`. Never
  hard-code numbers in components.
- **Filters/sort reset paging:** changing a filter, search term or sort order calls `reset()` and
  starts again from the first page. Debounce search input (about 300ms).
- **URL state:** on list pages, keep filters, sort and page size in the route query so views can
  be shared and the back button works. Don't put raw Firestore cursors in the URL; store the last
  doc id if you need to restore the position.
- **Totals:** only show a total count when it's needed, and get it with
  `getCountFromServer()` (aggregate query) — never by reading every doc. Cache it per filter set.
- **UI patterns** (choose per screen, then use the same one everywhere for that kind of list):
  - Desktop tables / admin lists → numbered pages with `BasePagination` (`v-model:current-page`,
    `total-pages`).
  - Mobile and feeds → "Load more" button, or infinite scroll with `useIntersectionObserver`
    from VueUse. Infinite scroll always has a "Load more" fallback for accessibility.
  - Tables on mobile collapse to cards while keeping the same paging behavior.
- **States:** first page uses the §6 states (skeleton / error / empty). Loading more pages shows
  an inline spinner below the list and keeps the items already loaded. If a next page fails,
  show an inline retry and don't clear the list.
- **Real-time lists:** if a list uses `onSnapshot`, only listen to the first page or the loaded
  window, and unsubscribe in `onScopeDispose` / when the list resets.
- **Security:** the rules must keep holding for paged queries. Every query must include the
  filters the rules require (e.g. `where('farmId', '==', farmId)`); rules aren't filters.
  Optionally cap query size in the rules with `request.query.limit <= 100`.

## 14. Git workflow — branches

Every task starts on its own, properly named branch. **Never commit directly to `main`.**

- Before making any change, check the current branch (`git status`). If you're on `main` (or on a
  branch for a different task):
  1. Make sure the working tree is clean. If there are uncommitted changes that aren't yours,
     stop and ask the user what to do with them.
  2. Update `main` (`git pull` when a remote exists).
  3. Create the task branch from `main`: `git checkout -b <type>/<short-description>`.
- If the current branch already belongs to this task, keep working on it.
- **Branch name format:** `<type>/<short-kebab-case-description>`, lowercase, 2–5 words, no
  spaces or special characters. Add the ticket id when there is one:
  `feat/BM-42-flock-list-pagination`.

| Type | Use for | Example |
|---|---|---|
| `feat/` | new feature | `feat/flock-list-pagination` |
| `fix/` | bug fix | `fix/mortality-rate-calculation` |
| `refactor/` | code change with no behavior change | `refactor/network-error-mapping` |
| `chore/` | tooling, deps, config | `chore/install-pinia-firebase` |
| `docs/` | documentation only | `docs/update-dev-rules` |
| `style/` | UI/styling only | `style/dark-mode-sidebar` |
| `test/` | tests only | `test/firestore-rules-flocks` |
| `security/` | security rules, auth hardening | `security/firestore-farm-ownership` |

- One branch = one task. Don't mix unrelated changes; start a new branch for them.
- **Commits** use Conventional Commits: `<type>(<scope>): <summary>`, e.g.
  `feat(flocks): add cursor pagination to flock list`. Keep them small and logical.
- Only commit, push, merge or open a PR when the user asks. Never force-push, rebase shared
  branches, or delete branches without explicit permission.
- When finished, tell the user the branch name and summarize what's on it.

## 15. Before finishing any change

- [ ] Work is on a properly named task branch, not `main`.
- [ ] Follows the layering in §3; no Firebase imports outside `services/`.
- [ ] All async calls go through `network.ts`; loading/error/empty states are handled.
- [ ] Security rules updated for any data-model change.
- [ ] Uses theme tokens and `Base*` components; works on mobile and in dark mode.
- [ ] Lists that can grow are paginated with `usePagination` (cursor-based, indexed).
- [ ] No duplicated logic or UI; naming and comments follow these rules.
- [ ] `npm run build` passes with no type errors.
