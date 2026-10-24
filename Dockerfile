# Install application dependencies
FROM node:24-alpine AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Runtime image
FROM node:24-alpine AS runtime

ENV NODE_ENV=production
WORKDIR /app

# The application starts with node directly; npm is build tooling.
RUN rm -rf /usr/local/lib/node_modules/npm \
    && rm -f /usr/local/bin/npm /usr/local/bin/npx

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

EXPOSE 5000

CMD ["node", "index.js"]