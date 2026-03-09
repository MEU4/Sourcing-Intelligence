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
COPY api/tsconfig.json ./
RUN npm install
COPY api/src ./src
RUN npm run build
# Show compiled output for debugging
RUN find dist -name "*.js" | head -20

# ── Stage 3: Production image ─────────────────────────────────────────────────
FROM node:20-slim
WORKDIR /app

# Copy built backend
COPY --from=backend-builder /app/api/dist ./api/dist
COPY --from=backend-builder /app/api/node_modules ./api/node_modules
COPY --from=backend-builder /app/api/package.json ./api/package.json

# Copy built frontend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Try both possible paths
CMD ["sh", "-c", "node api/dist/src/server.js 2>/dev/null || node api/dist/server.js"]
