FROM node:12.8.0

WORKDIR /var/app

ADD package.json .
ADD package-lock.json .
RUN npm install
ADD . .

EXPOSE 3101
CMD ["npm", "start"]
