An experiment in participatory Zoom breakouts.

To run:
```
echo SECRET_KEY=changemeplease > docker.env
echo DEBUG=True >> docker.env
docker-compose up


```

You'll need to [create a Zoom OAuth App](https://marketplace.zoom.us/docs/guides/build/oauth-app) and update the docker.env file with the API keys and set other variables.

```
SECRET_KEY=changemeplease
DEBUG=True
DOMAIN=localhost
ZOOM_CLIENT_ID=
ZOOM_CLIENT_SECRET=
ZOOM_REDIRECT_URL=https://YOUR_DOMAIN/zoom/callback
```

If you want to set up the environment to test locally, you can use a non-existent domain for the ZOOM_REDIRECT_RUL, or a domain you control and manually fix the URL you are redirected to after a successful OAuth flow to point to your dev environment.


Create db:

```
docker-compose exec postgres psql -U postgres -c "create user unbreakout WITH PASSWORD 'password';"
docker-compose exec postgres psql -U postgres -c "create database unbreakout with owner unbreakout;"
docker-compose run --rm django /opt/app-venv/bin/python manage.py migrate
```

Create a django admin user
```
docker-compose run --rm django /opt/app-venv/bin/python manage.py createsuperuser
```

And restart the django container
```
docker-compose restart django
```

You should now be able to access the local environment at http://localhost:8000/
