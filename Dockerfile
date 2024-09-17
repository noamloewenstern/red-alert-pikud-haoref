
FROM node:21.7.1-alpine as base

RUN npm install -g pnpm

WORKDIR /usr/src/app

FROM base as build-common
# COPY . .
COPY package.json pnpm-workspace.yaml ./packages ./
COPY ./packages/ ./packages/

RUN apk add --update --no-cache python3 build-base gcc --virtual .gyp  && ln -sf /usr/bin/python3 /usr/bin/python \
    && pnpm install && pnpm install -w  \
    && apk del .gyp

RUN pnpm common build && \
    pnpm db build

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

# COPY package.json pnpm-workspace.yaml ./packages ./apps/bot ./apps/alerts-listener ./apps/bot ./apps/clean-db ./apps/webapp-server ./


# Build all workspace packages and apps.
# RUN pnpm common build && \
#     pnpm db build
# pnpm clean-db build && \
# pnpm listener build && \
# pnpm bot build && \
# pnpm webapp-server build
# RUN pnpm webapp build


# FROM base as production

ENV NODE_ENV production


# RUN apk add --update --no-cache python3 build-base gcc --virtual .gyp  && ln -sf /usr/bin/python3 /usr/bin/python \
#     && pnpm install && pnpm install --prod -w --filter=!./apps/webapp-miniapp \
#     && apk del .gyp

# USER node

# FROM base as build

# COPY --from=build /usr/src/app/packages/common/dist ./packages/common/dist
# COPY --from=build /usr/src/app/packages/db/dist ./packages/db/dist
# COPY --from=build /usr/src/app/apps/clean-db/dist ./apps/clean-db/dist
# COPY --from=build /usr/src/app/apps/alerts-listener/dist ./apps/alerts-listener/dist
# COPY --from=build /usr/src/app/apps/bot/dist ./apps/bot/dist
# COPY --from=build /usr/src/app/apps/webapp-server/dist ./apps/webapp-server/dist
# COPY --from=build /usr/src/app/apps/webapp/dist ./apps/webapp/dist

# Expose the port that the application listens on.
EXPOSE 8080

# Run the application.
ENV PACKAGE=webapp-server
ENV COMMAND=start

CMD ["sh", "-c", "pnpm $PACKAGE $COMMAND"]


