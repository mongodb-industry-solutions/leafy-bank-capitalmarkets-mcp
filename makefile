build:
	@if [ ! -f .env ]; then \
		echo "❌ Error: .env file not found!"; \
		echo "📝 Please copy env.example to .env and fill in your MongoDB credentials:"; \
		echo "   cp env.example .env"; \
		echo "   # Then edit .env with your actual values"; \
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
	@if [ ! -f .env ]; then \
		echo "📝 Creating .env file from template..."; \
		cp env.example .env; \
		echo "✅ .env file created!"; \
		echo "📝 Please edit .env with your actual MongoDB credentials"; \
	else \
		echo "✅ .env file already exists"; \
	fi