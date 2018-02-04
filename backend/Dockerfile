FROM node:latest

WORKDIR /var/app

ADD package.json .
RUN npm install
ADD . .

EXPOSE 3001
CMD ["npm", "start"]
