# ── Stage 1: Build React frontend ────────────────────────────────────────────
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Build Express backend ───────────────────────────────────────────
FROM node:20-slim AS backend-builder
WORKDIR /app/api
COPY api/package*.json ./
RUN npm install
COPY api/ ./
RUN npm run build

# ── Stage 3: Production image ─────────────────────────────────────────────────
FROM node:20-slim
WORKDIR /app

COPY --from=backend-builder /app/api/dist ./api/dist
COPY --from=backend-builder /app/api/node_modules ./api/node_modules
COPY --from=backend-builder /app/api/package.json ./api/package.json

COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "api/dist/src/server.js"]
