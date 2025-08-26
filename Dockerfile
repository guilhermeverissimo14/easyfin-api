FROM node:20.9.0-alpine3.17 as builder
WORKDIR /
ENV PORT 8080 
ENV HOST 0.0.0.0
ENV PATH /node_modules/.bin:$PATH
COPY package*.json ./
COPY .env ./
COPY public ./public
RUN npm install -g npm@10.8.3
RUN npm install
COPY tsconfig.json ./
COPY . ./
RUN npm run build
EXPOSE 8080
CMD ["npm", "run", "prod"]