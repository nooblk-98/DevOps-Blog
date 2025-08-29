# ========= builder: install deps and build frontend =========
FROM node:20-alpine AS builder
WORKDIR /app

# Enable corepack (pnpm)
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
# Build the frontend (outputs to /app/dist)
RUN pnpm build

# ========= runner: production server =========
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Enable corepack (pnpm)
RUN corepack enable

# Copy only runtime files and install prod deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy server code and built frontend
COPY server ./server
COPY dist ./dist

# Create runtime dirs for db and uploads
RUN mkdir -p /app/db /app/public/uploads

# Expose app port
EXPOSE 8080

# Environment defaults (override in compose/production)
ENV PORT=8080 \
    JWT_SECRET=change-me \
    ADMIN_EMAIL=admin@example.com \
    ADMIN_PASSWORD=admin123

CMD ["node", "server/index.js"]

