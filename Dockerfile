FROM node:lts-slim AS build
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV BUILD_PRECOMPRESS="false"
ENV BUILD_TRAILING_SLASH="true"
RUN corepack enable


WORKDIR /build/

COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store  \
    --mount=type=cache,id=pnpm-modules,target=/build/node_modules \
    pnpm install --frozen-lockfile \
    && pnpm build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store  \
    pnpm install --frozen-lockfile --prod
RUN chown -R 1000:1000 /build


FROM node:lts-alpine
#ENV DEBIAN_FRONTEND=noninteractive
#RUN apt-get update -y && apt-get install wget -y --no-install-recommends
RUN apk add --no-cache wget ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/cache/apk/*
COPY --from=build /build/ /app/
WORKDIR /app/
EXPOSE 3000
USER 1000:1000
#CMD ["run", "--allow-net", "--allow-read", "--allow-env","--allow-ffi", "/app/dist/index.js"]
CMD ["node", "dist/index.js"]