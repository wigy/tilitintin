FROM node:12.8.0

WORKDIR /var/app

ADD package.json .
ADD package-lock.json .
RUN npm install
ADD . .
RUN npm run build

EXPOSE 3102
CMD ["npm", "start"]
