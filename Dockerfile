
FROM node:21.7.1-alpine as base

RUN npm install -g pnpm

WORKDIR /usr/src/app

# multistage cache packages
FROM base as build-common

COPY package.json pnpm-workspace.yaml ./packages ./
COPY ./packages/ ./packages/

RUN apk add --update --no-cache python3 build-base gcc --virtual .gyp  && ln -sf /usr/bin/python3 /usr/bin/python \
    && pnpm install && pnpm install -w  \
    && apk del .gyp

RUN pnpm common build && \
    pnpm db build

# multistage cache packages
FROM base as build-apps

COPY package.json pnpm-workspace.yaml  ./
COPY --from=build-common /usr/src/app/packages/ ./packages/
COPY ./apps/bot/ ./apps/bot/
COPY ./apps/alerts-listener/ ./apps/alerts-listener/
COPY ./apps/bot/ ./apps/bot/
COPY ./apps/clean-db ./apps/clean-db
COPY ./apps/webapp-server/  ./apps/webapp-server/

RUN apk add --update --no-cache python3 build-base gcc --virtual .gyp  && ln -sf /usr/bin/python3 /usr/bin/python \
    && pnpm install && pnpm install -w --filter=!./apps/webapp-miniapp \
    && apk del .gyp

ENV NODE_ENV production

EXPOSE 8080

ENV PACKAGE=webapp-server
ENV COMMAND=start

CMD ["sh", "-c", "pnpm $PACKAGE $COMMAND"]


