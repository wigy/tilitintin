FROM node:12.8.0

WORKDIR /var/app

ADD package.json .
ADD yarn.lock .
RUN yarn install
ADD . .

CMD ["npm", "start"]
