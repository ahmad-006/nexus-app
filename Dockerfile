# Multi-stage production container for NEXUS using official Bun Alpine image
FROM oven/bun:1.2-alpine AS builder

WORKDIR /app

# Cache dependencies
COPY client/package.json client/bun.lock* ./client/
COPY server/package.json server/bun.lock* ./server/

RUN cd client && bun install
RUN cd server && bun install

# Copy frontend source and compile production bundle
COPY client ./client
RUN cd client && bun run build

# Copy server source
COPY server ./server

# Production runner stage
FROM oven/bun:1.2-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8000

# Copy compiled static assets and server runtime with non-root ownership (UID 1000)
COPY --from=builder --chown=bun:bun /app/client/dist ./client/dist
COPY --from=builder --chown=bun:bun /app/server ./server

USER bun

EXPOSE 8000

CMD ["bun", "server/server.js"]
