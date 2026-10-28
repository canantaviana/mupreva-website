# Base image
FROM php:8.2-apache

# Enable mod_rewrite
RUN a2enmod rewrite
RUN a2enmod headers
RUN a2enmod env
# Needed for the ExpiresByType caching rules in the project's .htaccess files
RUN a2enmod expires
# Compress text responses (html/css/js/json) over the wire
RUN a2enmod deflate

# HTTPS with a self-signed certificate for localhost (development only).
# Needed because the session cookie is 'secure' (only sent over https)
RUN apt-get update && apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*
RUN openssl req -x509 -nodes -newkey rsa:2048 -days 3650 \
		-subj "/CN=localhost" \
		-addext "subjectAltName=DNS:localhost,IP:127.0.0.1" \
		-keyout /etc/ssl/private/ssl-cert-snakeoil.key \
		-out /etc/ssl/certs/ssl-cert-snakeoil.pem
RUN a2enmod ssl && a2ensite default-ssl

# OPcache ships with the base image but is OFF by default, so every request
# recompiles every PHP file from source. Enable it for real speedups.
RUN docker-php-ext-enable opcache
RUN { \
		echo 'opcache.enable=1'; \
		echo 'opcache.memory_consumption=128'; \
		echo 'opcache.interned_strings_buffer=16'; \
		echo 'opcache.max_accelerated_files=10000'; \
		echo 'opcache.validate_timestamps=1'; \
		echo 'opcache.revalidate_freq=2'; \
	} > /usr/local/etc/php/conf.d/opcache-recommended.ini

ENV APACHE_DOCUMENT_ROOT /var/www/html
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
