build:
	@if [ ! -f src/.env ]; then \
		echo "❌ Error: .env file not found in src/ directory!"; \
		echo "📝 Please create src/.env and fill in your MongoDB credentials:"; \
		echo "   # Create src/.env with your actual values"; \
		exit 1; \
	fi
	docker compose up --build -d

start: 
	docker compose start

stop:
	docker compose stop

clean:
	docker compose down --rmi all -v

setup:
	@if [ ! -f src/.env ]; then \
		echo "📝 Creating .env file from template..."; \
		echo "📝 Please create src/.env with your actual MongoDB credentials"; \
	else \
		echo "✅ src/.env file already exists"; \
	fi