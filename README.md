# qone-front

> Front-end shell: packages the domain UIs

Part of the **Qampus (Quorum One)** distributed system — team `quorum-one`, Grupo 1.
Governance and documentation live in [`qone-docs`](https://github.com/code-corhuila/qone-docs).

## Purpose

The container of the Qampus interface (course norm 5.5, Annex H). It owns the **only HTTP
client** and the **session**: the gateway URL, the token, `X-Correlation-Id`, the 10 s timeout
and the one place that turns an HTTP status into the message a person sees with its `traceId`.
It composes the five domain portals (`qone-<domain>-portal`) as Module Federation remotes
loaded by route with `loaded-first`, so a portal that is down only disables its own area. It
also provides the layout, the 404 page and, on `develop` only, the development sign-in of
norm 5.5.2.

Specification: `09-microservices/services/09-front/README.md`, ADR-007, ADR-009 and the
contracts in `07-api/contracts/openapi/` of `qone-docs`.

## How to run it

Requirements: Node 22 LTS (or 24) and npm. The gateway (`qone-api-gateway`) at
`VITE_GATEWAY_URL`, or `VITE_USE_MOCKS=true` to serve synthetic data (the `06-data` seeds).

```bash
cp .env.example .env        # fill the placeholders; .env is ignored by git
npm ci
npm run dev                 # http://localhost:5173
```

Checks, the same ones `ci.yml` runs on every pull request:

```bash
npm run typecheck           # TypeScript strict
npm test                    # Vitest + Testing Library (+ MSW for integration)
npm run build               # tsc -b && vite build -> dist/
```

Container image and compose: `deploy/` (next increment).

## Dependencies

| It needs | For |
|---|---|
| `qone-api-gateway` at `VITE_GATEWAY_URL` | every API call; the browser never reaches a service directly |
| `qone-infra/scripts/dev-token.sh` | a token for the development sign-in while `qone-identity-portal` does not exist |
| `qone-<domain>-portal` remotes | the screens of each domain, loaded by route; optional at boot |

## Structure

```
src/
├── app/App.tsx            root component and routes
├── core/http/apiClient.ts the shared client (exposed as shell/apiClient)      [HU-AUT-001]
├── core/auth/             session, RequireAuth, development sign-in           [HU-AUT-001]
├── core/errors/           RemoteBoundary                                      [HU-WEB-001]
├── remotes/registry.ts    which portals exist and where they mount            [HU-WEB-001]
├── layout/Shell.tsx       navigation and layout, 404                          [HU-WEB-001]
├── mocks/                 MSW handlers and fixtures (identity, development)   [ADR-009]
└── test/setup.ts          Testing Library and jest-dom
```

## Branching

Three permanent branches. **None of them accepts a direct commit** — you enter through a child
branch and leave through a Pull Request.

```
develop  <--PR--  feat/... fix/... chore/...
qa       <--PR--  qa/...
main     <--PR--  release/...  hotfix/...
```

Promotion happens **by re-application** (`git cherry-pick -x`), never by merging one permanent
branch into another: `merge develop -> qa` and `merge qa -> main` do not exist in this model.

`main` requires **1 approval from `ariel5253`**. On `develop` and `qa` the team sets its own review
rule.

Full policy: `00-governance/branching-policy.md` in `qone-docs`.
