FROM nginx
COPY index.html /usr/share/nginx/html/
COPY style/style.css /usr/share/nginx/html/style/
COPY js /usr/share/nginx/html/js/
COPY node_modules/vanilla-spinner/dist/vanilla-spinner.js /usr/share/nginx/html/node_modules/vanilla-spinner/dist/vanilla-spinner.js
c