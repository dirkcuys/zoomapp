An experiment in participatory Zoom breakouts.

To run:
```
touch docker.env
docker-compose up
```

You'll need to add API keys and other config to docker.env

Create db:

docker-compose exec postgres psql -U postgres -c "create user unbreakout WITH PASSWORD 'password';"
docker-compose exec postgres psql -U postgres -c "create database unbreakout with owner unbreakout;"
