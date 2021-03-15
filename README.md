An experiment in participatory Zoom breakouts.

To run:
```
touch docker.env
docker-compose up
```

You'll need to [create a Zoom OAuth App](https://marketplace.zoom.us/docs/guides/build/oauth-app) and update the docker.env file with the API keys and set other variables.

```
SECRET_KEY=<anything goes here>
DEBUG=True
DOMAIN=YOUR_DOMAIN
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_REDIRECT_URL=https://YOUR_DOMAIN/zoom/callback
```

If you want to set up the enviroment to test locally, you can use a non-existent domain, or a domain you control and manually fix the URL you are redirected to after a successful OAuth flow to point to localhost.


Create db:

```
docker-compose exec postgres psql -U postgres -c "create user unbreakout WITH PASSWORD 'password';"
docker-compose exec postgres psql -U postgres -c "create database unbreakout with owner unbreakout;"
```

You should now be able to access the local environment at http://localhost:8000/
