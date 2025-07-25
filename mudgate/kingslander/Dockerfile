# syntax=docker/dockerfile:1
# ── 1. use the current LTS (Node 22) on Alpine for a small image
# can see latest versions at https://hub.docker.com/_/node and https://nodejs.org/en/about/releases/
FROM node:20-alpine3.22

# ── 2. create a non‑root user for safety (optional for local only)
RUN adduser -D app
USER app

# ── 3. work in /usr/src/app – the conventional place
WORKDIR /usr/src/app

# ── 4. copy only package manifests first, so layer caching works
COPY --chown=app package*.json ./

# npm ci is repeatable & respects package‑lock.json
RUN npm ci

# ── 5. now copy the rest of the source
COPY --chown=app . .

# ── 6. expose CRA’s default dev port
EXPOSE 3000

# ── 7. start the hot‑reload dev server
CMD ["npm", "start"]



# Build once
# docker build -f local.Dockerfile -t kingslander-local .
#
# Hot‑reload dev session
# docker run --rm -it -p 3000:3000 \
#           -v "$PWD":/usr/src/app \
#           kingslander-local
#   ↑ volume mount lets edits on the host trigger CRA reloads inside container