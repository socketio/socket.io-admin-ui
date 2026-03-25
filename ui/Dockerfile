FROM node:24-alpine AS node-builder

WORKDIR /app

# Install app dependencies
COPY package.json .
RUN npm install

# Bundle app source
COPY . .

RUN npm run build

FROM nginx:1.20.1

WORKDIR /usr/share/nginx/html

COPY --from=node-builder /app/dist .
