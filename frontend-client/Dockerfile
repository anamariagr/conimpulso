FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}
RUN npm run build

FROM node:22-slim
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY static-spa-server.cjs ./server.cjs

EXPOSE 8080
ENV PORT=8080
CMD ["node", "server.cjs"]
