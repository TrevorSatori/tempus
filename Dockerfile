FROM node:lts-slim

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=9111

EXPOSE 9111

RUN npm run build

CMD ["npm", "run", "start"]