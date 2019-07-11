FROM node:10.8.0

WORKDIR /var/app

ADD package.json .
RUN npm install
ADD . .

EXPOSE 3102
CMD ["npm", "start"]
