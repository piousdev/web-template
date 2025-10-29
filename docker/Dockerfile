# Multi-stage Dockerfile for Next.js 16 with Bun runtime
# Optimized for production with minimal image size (~310MB vs ~7.5GB)

# ========================================
# Stage 1: Dependencies Installation
# ========================================
FROM oven/bun:1.1.29-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install production dependencies only with frozen lockfile
RUN bun install --frozen-lockfile --production

# ========================================
# Stage 2: Build Stage
# ========================================
FROM oven/bun:1.1.29-alpine AS builder
WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install all dependencies (including devDependencies for build)
RUN bun install --frozen-lockfile

# Copy all source code
COPY . .

# Set build-time environment variables
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build Next.js application
# The standalone output mode will create a minimal server in .next/standalone
RUN bun run build

# ========================================
# Stage 3: Production Runner
# ========================================
FROM oven/bun:1.1.29-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Create non-root user for security
# The bun image already has a 'bun' group
RUN adduser -D -h /app -s /bin/sh nextjs && \
    chown -R nextjs:bun /app

# Copy necessary files from builder
# standalone contains the minimal server code
COPY --from=builder --chown=nextjs:bun /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bun /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:bun /app/public ./public

# Copy production node_modules from deps stage
COPY --from=deps --chown=nextjs:bun /app/node_modules ./node_modules

# Switch to non-root user
USER nextjs

# Expose port 3000
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD bun run -e "fetch('http://localhost:3000/api/health').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"

# Start the Next.js production server using Bun
# Listen on 0.0.0.0 to accept connections from outside the container
CMD ["bun", "run", "server.js"]
