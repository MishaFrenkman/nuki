FROM node:lts-alpine
WORKDIR /usr/src/app

COPY package.json yarn.lock ./
COPY . .
RUN yarn install --frozen-lockfile

RUN yarn build

EXPOSE 8080

CMD ["node", "bin/index.js"]