FROM 096d3353d349

USER root

RUN docker-php-ext-install opcache \
    && docker-php-ext-enable opcache

WORKDIR /var/www
