# qone-front: build the shell with Node 22 and serve the static bundle with NGINX (Annex H).
# Build arguments are Vite's build-time variables; VITE_DEV_LOGIN defaults to false so an image
# built without arguments never carries the development sign-in (norm 5.5.2).
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tsconfig.json tsconfig.app.json tsconfig.node.json vite.config.ts index.html ./
COPY public ./public
COPY src ./src
ARG VITE_GATEWAY_URL=http://localhost:8080
ARG VITE_DEV_LOGIN=false
ARG VITE_USE_MOCKS=false
ARG VITE_REMOTE_IDENTITY_URL=
ARG VITE_REMOTE_CATALOG_URL=
ARG VITE_REMOTE_ENROLLMENT_URL=
ARG VITE_REMOTE_BILLING_URL=
ARG VITE_REMOTE_ADVISOR_URL=
RUN npm run build

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=10s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/health || exit 1
