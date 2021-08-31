FROM node:14-alpine as node-builder

WORKDIR /app

RUN /bin/sed -i 's,http://dl-cdn.alpinelinux.org,https://mirrors.aliyun.com,g' /etc/apk/repositories 2> /dev/null \
    && apk add --no-cache --update openssl-dev make librdkafka openssl tini bash python3  g++ \
    && rm -rf /var/cache/apk/*

# Install app dependencies
COPY package.json .
RUN npm install

# Bundle app source
COPY . .

RUN npm run build

FROM nginx:1.20.1

WORKDIR /usr/share/nginx/html

COPY --from=node-builder /app/dist .
