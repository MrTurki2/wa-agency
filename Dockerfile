FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
RUN mkdir -p data config
EXPOSE 3201
CMD ["node", "server.mjs"]
