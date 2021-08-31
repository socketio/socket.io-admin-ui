FROM node:14-alpine as node-builder

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
