FROM node:20.8.0

ENV NODE_PATH=/packages/node_modules
WORKDIR /packages

COPY package.json .
COPY package-lock.json .

RUN npm install

ENTRYPOINT ["npm"]
