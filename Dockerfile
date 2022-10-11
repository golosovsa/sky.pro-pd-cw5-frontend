FROM nginx
COPY index.html /usr/share/nginx/html/
COPY style/style.css /usr/share/nginx/html/style/
COPY js /usr/share/nginx/html/js/
