FROM node:latest

WORKDIR /var/app

ADD package.json .
RUN npm install
ADD . .

EXPOSE 3002
CMD ["npm", "start"]
