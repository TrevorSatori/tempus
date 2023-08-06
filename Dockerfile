FROM node:lts-slim as builder

WORKDIR /app

COPY . .

RUN echo "DB_PATH=/data/tempus.db" > .env

RUN npm install

RUN npm run build

FROM node:lts-slim

WORKDIR /app

COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app/package-lock.json /app/

RUN npm install 

ENV PORT=9111

EXPOSE 9111

CMD ["node", "build/index.js"]