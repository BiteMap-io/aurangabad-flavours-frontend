# Stage 1: Build the Vite + React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependency manifests first for better layer caching
COPY package.json package-lock.json ./

RUN npm ci

# Copy the rest of the source code
COPY . .

# Accept build-time env vars (Vite bakes VITE_* vars at build time)
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:stable-alpine

# Copy custom nginx config for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
