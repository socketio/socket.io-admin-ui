FROM node:24-alpine as node-builder

WORKDIR /app

# Install app dependencies
COPY package.json .
RUN pnpm install

# Bundle app source
COPY . .

RUN pnpm run build

FROM nginx:latest

WORKDIR /usr/share/nginx/html

COPY --from=node-builder /app/dist .
