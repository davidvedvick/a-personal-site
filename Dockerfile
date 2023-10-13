FROM node:20.8.0

WORKDIR /src

COPY package.json .
COPY package-lock.json .

RUN npm install

ENTRYPOINT ["npm"]
