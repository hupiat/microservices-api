# Use official PHP image
FROM php:8.2-fpm

# Set working directory
WORKDIR /var/www

# Install dependencies
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_mysql

# Copy existing application files
COPY . .

# Install PHP dependencies
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

# Expose port
EXPOSE 8000

# Start the application
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
