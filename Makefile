COMPOSE = docker compose

# ----- Dev -----
up:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

# ----- Django management -----
migrate:
	$(COMPOSE) exec backend python manage.py migrate

makemigrations:
	$(COMPOSE) exec backend python manage.py makemigrations

seed:
	$(COMPOSE) exec backend python manage.py seed_categories

shell:
	$(COMPOSE) exec backend python manage.py shell

# ----- Tests -----
test:
	$(COMPOSE) exec backend python -m pytest

test-v:
	$(COMPOSE) exec backend python -m pytest -v

# ----- Logs -----
logs:
	$(COMPOSE) logs -f backend
