# FROM node:20.15.0 AS node_builder
# WORKDIR /app
# COPY ./prompter_app/ ./
# RUN npm install
# RUN npm run build

FROM node:20.15.0
WORKDIR /app
COPY ./build/ ./dist
COPY package.json ./
COPY package-lock.json ./
RUN npm install

# Uploads to song folders (adapter-node accepts 512K by default)
ENV BODY_SIZE_LIMIT=200M

EXPOSE 3000

CMD ["node", "dist/index.js"]
