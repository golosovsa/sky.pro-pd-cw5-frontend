FROM nginx:latest

COPY index.html /usr/web/
COPY style/style.css /usr/web/style/
COPY js /usr/web/js/
COPY node_modules/vanilla-spinner/dist/vanilla-spinner.js /usr/web/node_modules/vanilla-spinner/dist/vanilla-spinner.js
RUN rm -frv /etc/nginx/conf.d/*
COPY nginx/nginx.conf /etc/nginx/conf.d/skypro-pd-cw5.ru.conf


CMD ["nginx", "-g", "daemon off;"]