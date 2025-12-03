# Dockerfile
FROM node:20-alpine AS base

WORKDIR /app

# Install deps
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
  if [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then npm i -g pnpm && pnpm install --frozen-lockfile; \
  elif [ -f yarn.lock ]; then yarn install --frozen-lockfile; \
  else npm install; \
  fi

# Copy source
COPY . .

# --- For production build (if you want prod later) ---
# RUN npm run build

# Default command is dev server (overridable in docker-compose)
CMD ["npm", "run", "dev"]
