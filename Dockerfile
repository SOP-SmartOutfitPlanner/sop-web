# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY postcss.config.mjs ./
COPY next.config.ts ./
COPY components.json ./
COPY middleware.ts ./

# Install dependencies
RUN npm ci

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/tsconfig.json ./
COPY --from=deps /app/tailwind.config.ts ./
COPY --from=deps /app/postcss.config.mjs ./
COPY --from=deps /app/next.config.ts ./
COPY --from=deps /app/components.json ./
COPY --from=deps /app/middleware.ts ./

# Copy source files
COPY src ./src
COPY public ./public
COPY package.json package-lock.json* ./

RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/package.json ./
COPY --from=builder /app/next.config.ts ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
RUN npm ci --production

EXPOSE 6969
CMD ["npm", "start"]