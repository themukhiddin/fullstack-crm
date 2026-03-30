FROM php:8.4-fpm-alpine

RUN apk add --no-cache \
    postgresql-dev \
    && docker-php-ext-install pdo_pgsql

RUN apk add --no-cache autoconf gcc g++ make \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del autoconf gcc g++ make

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

WORKDIR /var/www

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]
