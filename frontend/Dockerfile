FROM nginx:alpine AS builder

COPY index.html /usr/share/nginx/html/

FROM nginx:alpine 

RUN rm /etc/nginx/conf.d/default.conf


HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quite --tries=1 --spider htpp://localhost/ || exit 1

COPY --from=builder /usr/share/nginx/html /usr/share/nginx/html

EXPOSE 80 


CMD ["nginx", "-g", "daemon of;"]
