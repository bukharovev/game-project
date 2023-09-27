setup:
	yarn install
	nx run game-engine:migration:run
	nx run wallet:migration:run
	nx run wallet:seed
	docker-compose up -d

start-both:
	nx run-many --target=serve --projects=game-engine,wallet

start-game-engine:
	nx run game-engine:serve

start-wallet:
	nx run wallet:serve
