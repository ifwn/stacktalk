# ---------- build stage ---------- #
FROM node:20 AS builder
WORKDIR /app
COPY package*.json .
RUN npm ci
COPY . .
# outputs /app/build
RUN npm run build                

# ---------- runtime stage ---------- #
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]