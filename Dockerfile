FROM node:lts AS frontend
WORKDIR /opt/app/
COPY package.json /opt/app/
RUN npm install --quiet --production
COPY . /opt/app/
RUN npm run build

from python:3
workdir /opt/app
copy requirements.txt .
RUN python3 -m venv /opt/app-venv/ \
    && /opt/app-venv/bin/pip --no-cache-dir install -r requirements.txt
COPY . /opt/app
COPY --from=frontend /opt/app/static/dist static/dist
ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && rm dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz
COPY docker/entry.sh /entry.sh
RUN mkdir -p /var/lib/celery && \
    addgroup --gid 5313 celery && \
    adduser --uid 5313 --gid 5313 celery && \
    chown celery:celery /var/lib/celery/
EXPOSE 80
ENTRYPOINT ["/entry.sh"]
CMD ["/opt/app-venv/bin/gunicorn", "unbreakout.asgi:application", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:80", "--forwarded-allow-ips=\"*\""]
