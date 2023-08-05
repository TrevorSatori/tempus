FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT 7777

EXPOSE $PORT

RUN npm run build

CMD ["npm", "run", "start"]