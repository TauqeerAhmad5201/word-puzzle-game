# ──────────────────────────────────────────────────────────────────────────────
# STAGE 1 — deps
# Purpose: install *only* production + dev dependencies so the next stage
#           can run `next build`. We do this in a separate stage so the
#           giant node_modules folder never bleeds into the final image.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps

# Why alpine? The Alpine Linux variant of the Node image is ~50 MB vs
# ~300 MB for the Debian-based one. It has everything Next.js needs.

WORKDIR /app
# WORKDIR creates the directory if it doesn't exist and sets it as the
# current directory for every subsequent RUN / COPY / CMD instruction.

COPY package.json package-lock.json* ./
# We copy ONLY the manifest files first — not the whole project.
# Docker caches each layer. If your source files change but package.json
# doesn't, Docker reuses this cached install layer → much faster rebuilds.
# The * after package-lock.json means the COPY won't fail if lockfile is absent.

RUN npm ci --frozen-lockfile
# `npm ci` is like `npm install` but:
#   - reads exactly what's in the lockfile (reproducible builds)
#   - fails if lockfile is out of sync with package.json
#   - faster than `npm install` in CI/Docker environments


# ──────────────────────────────────────────────────────────────────────────────
# STAGE 2 — builder
# Purpose: copy source code + node_modules from the deps stage, then
#           run `next build` to produce the .next/standalone output.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
# --from=deps pulls the node_modules we installed in Stage 1.
# Nothing from Stage 1 except what we explicitly copy comes through.

COPY . .
# Now copy the rest of the source code (app/, public/, tsconfig.json, etc.)

ENV NEXT_TELEMETRY_DISABLED=1
# Disables Next.js anonymous telemetry during the build.
# Not a security risk, just cleaner build logs inside a container.

RUN npm run build
# Runs `next build`. Because of `output: "standalone"` in next.config.ts,
# Next.js will emit a self-contained server to .next/standalone/ — it
# includes a minimal node_modules copy (only what the server actually imports).


# ──────────────────────────────────────────────────────────────────────────────
# STAGE 3 — runner  (this is the ONLY stage that ships in the final image)
# Purpose: copy the tiny standalone output and run the production server.
#          No build tools, no dev dependencies, no source code.
# ──────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Tells Node.js and Next.js this is a production environment, which enables
# optimisations (e.g. disabled React DevTools, shorter error messages).

ENV NEXT_TELEMETRY_DISABLED=1

# Security best practice: never run a web server as root inside a container.
# If an attacker exploits the app they would only get the `nodejs` user,
# not root access to the host machine.
RUN addgroup --system --gid 1001 nodejs
RUN adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
# Static assets (images, fonts, robots.txt, etc.) served directly by Next.js.

# Set correct ownership so the non-root user can read these files at runtime.
RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
# The standalone folder contains the minimal node.js server + its own
# trimmed node_modules. It's self-contained — no npm install needed.

COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Static build artifacts (JS chunks, CSS, etc.) must sit at this exact path
# so Next.js can serve them with the correct cache-control headers.

USER nextjs
# Switch to the non-root user for all instructions from here on.

EXPOSE 3000
# Documents that the container listens on port 3000.
# EXPOSE alone does NOT publish the port — you still need -p 3000:3000
# when running `docker run`, or `ports:` in docker-compose.

ENV PORT=3000
# The standalone server reads $PORT at startup to know which port to bind.

ENV HOSTNAME="0.0.0.0"
# Bind to all network interfaces inside the container so Docker can
# forward traffic to it. Default is localhost (127.0.0.1), which would
# be unreachable from outside the container.

CMD ["node", "server.js"]
# The standalone output puts a ready-to-run server.js at the root.
# We use `node server.js` directly (not `next start`) because the standalone
# bundle has no next CLI — it's just plain Node.js. Faster startup too.
