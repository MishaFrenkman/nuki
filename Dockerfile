FROM node:lts-alpine
WORKDIR /usr/src/app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY bin/index.js index.js

EXPOSE 8080

CMD ["node", "index.js"]

