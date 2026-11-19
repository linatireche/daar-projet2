.PHONY: build up down restart logs clean status

build:
	docker compose build

up:
	docker compose up --build -d

down:
	docker compose down

restart: down up

logs:
	docker compose logs -f

status:
	docker compose ps

clean:
	docker compose down -v
