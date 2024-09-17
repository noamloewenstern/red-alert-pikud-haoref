# syntax=docker.io/docker/dockerfile:1.7-labs
ARG NODE_VERSION=21.7.1
ARG PNPM_VERSION=9.7.1
ARG VITE_SERVER_URL=
ARG VITE_DEV_CHAT_ID=123123

FROM node:${NODE_VERSION}-alpine as frontend


RUN npm install -g pnpm@${PNPM_VERSION}

WORKDIR /usr/src/webapp

COPY ./apps/webapp-miniapp/package.json ./

RUN pnpm install


COPY --exclude=Caddyfile ./apps/webapp-miniapp/ ./

ENV NODE_ENV=production

ENV VITE_SERVER_URL=$VITE_SERVER_URL
ENV VITE_DEV_CHAT_ID=$VITE_DEV_CHAT_ID

RUN pnpm run build


# Caddy Build Image
FROM caddy:2.7.6-alpine

ARG PORT
ARG CADDY_BACKEND_HOST

# Copy the built application from the previous stage
COPY --from=frontend /usr/src/webapp/dist /srv
COPY --from=frontend /usr/src/webapp/dist /var/www/html

# Copy Caddyfile
COPY ./apps/webapp-miniapp/Caddyfile /etc/caddy/Caddyfile
RUN caddy fmt --overwrite /etc/caddy/Caddyfile

RUN caddy fmt --overwrite /etc/caddy/Caddyfile