#!/bin/sh
set -e

if [ -f composer.json ]; then
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

if [ -f artisan ]; then
    php artisan migrate --force
fi

exec "$@"
