FROM node:latest

WORKDIR /var/app

ADD package.json .
RUN npm install
ADD . .

EXPOSE 3102
CMD ["npm", "start"]
