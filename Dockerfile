# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY postcss.config.mjs ./
COPY next.config.ts ./
COPY components.json ./
COPY middleware.ts ./

# Install dependencies
RUN npm install --frozen-lockfile

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# copy từ stage deps
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/tsconfig.json ./
COPY --from=deps /app/postcss.config.mjs ./
COPY --from=deps /app/next.config.ts ./
COPY --from=deps /app/components.json ./
COPY --from=deps /app/middleware.ts ./

# Copy source files
COPY src ./src
COPY public ./public
COPY package.json package-lock.json* ./

# Copy .env file (created by GitHub Actions before docker build)
COPY .env .env

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

ENV PORT=6969
EXPOSE 6969
CMD ["npm", "start"]
