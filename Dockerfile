FROM node:16-alpine

LABEL maintainer="team@appwrite.io"

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY package* /usr/src/app

RUN npm install pm2 -g

RUN sleep 60



RUN npm ci && npm cache clean --force

COPY . .

CMD ["npm", "start"]

EXPOSE 3000
