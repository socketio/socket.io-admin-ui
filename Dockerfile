FROM nginx:stable-alpine
WORKDIR /app
COPY ./ui/dist .
COPY ./nginx.conf /etc/nginx/nginx.conf 
RUN command