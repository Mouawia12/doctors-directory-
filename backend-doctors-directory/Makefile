setup:
	test -f .env || cp .env.example .env
	composer install
	php artisan key:generate
	php artisan storage:link || true
	php artisan migrate:fresh --seed

lint:
	vendor/bin/pint
	vendor/bin/phpstan analyse

test:
	vendor/bin/pest
