## Multi-stage build: build frontend with pnpm then serve with nginx
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
# Use package-lock.json if present for deterministic installs
COPY package*.json ./

# Install dependencies: prefer `npm ci` when lockfile exists, otherwise fall back to `npm install`
RUN sh -c 'if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi'

# Copy rest of sources and build
COPY . .
RUN npm run build

FROM nginx:stable-alpine

# Copy built static files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config for container environment
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
