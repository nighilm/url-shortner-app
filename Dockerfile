FROM node:alpine as development
ADD . /usr/src/app
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

CMD sh -c ' npm run start:dev'
