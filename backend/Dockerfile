FROM node:12.8.0

WORKDIR /var/app

ADD package.json .
RUN npm install
ADD . .

EXPOSE 3001
CMD ["npm", "start"]
