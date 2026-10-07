## User story

<!-- The story this change serves, as an issue of the documentation repository -->
code-corhuila/qone-docs#NN

## What changes and why

<!-- A few lines. Link the contract, schema or ADR this follows when it applies. -->

## How it was tested

<!-- Tests that cover the change, written before the code (ADR-009), and the result of ci.yml -->
- [ ] Core tests (no React)
- [ ] Component tests (four states, forms)
- [ ] Integration tests against MSW (apiClient, session, remotes)
- [ ] `ci.yml` green

## Promotion trail

<!-- Only for pull requests to qa or main: every re-applied commit with its "(cherry picked from commit <sha>)" line (norm 10). -->

## Checklist

- [ ] No secret, key or token in the diff; `.env.example` lists every variable read
- [ ] No gateway URL and no token handling outside `qone-front` (norm 5.4.1)
- [ ] Types match the contract in `07-api/contracts/openapi/`
- [ ] Under 400 lines of change, excluding tests and generated files (norm 9.2)
- [ ] One story per branch; branch younger than five working days
