# ---- Build stage ----
FROM node:20-alpine AS builder

# Native deps for better-sqlite3
RUN apk add --no-cache python3 make g++

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
# Build sans toucher la DB (elle est en /data au runtime)
RUN rm -f projecttrak.db projecttrak.db-shm projecttrak.db-wal && npm run build
# Build sans toucher la DB (elle est en /data au runtime)
RUN rm -f projecttrak.db projecttrak.db-shm projecttrak.db-wal && npm run build

# Remove dev dependencies
RUN npm prune --production

# ---- Runtime stage ----
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# SQLite data directory
VOLUME /data
ENV DB_PATH=/data/projecttrak.db

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node_modules/.bin/next", "start"]
