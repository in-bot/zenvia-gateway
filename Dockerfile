FROM node:18-alpine

WORKDIR /code
ENV TZ=America/Sao_Paulo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

COPY package*.json /code/

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production
RUN npm ci

# Bundle app source
COPY . /code

EXPOSE 19000
CMD [ "node", "/code/src/server.js" ]
