# ============================
# Stage 1: Dependencies
# ============================
FROM node:20-alpine AS deps
WORKDIR /app

# Only dependency files (best cache)
COPY package.json package-lock.json* ./
RUN npm ci

# ============================
# Stage 2: Builder
# ============================
FROM node:20-alpine AS builder
WORKDIR /app

# Bring node_modules from deps
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./

# Project config
COPY tsconfig.json ./
COPY postcss.config.mjs ./
COPY next.config.ts ./
COPY components.json ./
COPY proxy.ts ./

# Source
COPY src ./src
COPY public ./public

# Env (if you really need it for build)
COPY .env .env

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ============================
# Stage 3: Runner
# ============================
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=6969

# Copy runtime artifacts only
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 6969
CMD ["npm", "start"]
