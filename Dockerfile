# Builder
FROM docker.io/oven/bun:latest AS builder
WORKDIR /build/

COPY . ./

ENV NODE_ENV=production
ENV PORT=4000

RUN bun install --production --frozen-lockfile --ignore-scripts
RUN bun run build:standalone

# Runner
FROM gcr.io/distroless/base-nossl-debian12:nonroot AS runner

COPY --from=builder /build/dist/aurora ./

ENV PORT=4000

EXPOSE 4000/tcp

CMD ["./aurora"]
