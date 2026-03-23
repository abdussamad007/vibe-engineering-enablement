# Stage 1: Build the React application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
# We pass VITE_API_URL as a build argument so it's baked into the static files
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the build output to Nginx's html directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the Nginx configuration template
# Nginx's docker image automatically runs envsubst on files in /etc/nginx/templates/*.template
# and outputs the result to /etc/nginx/conf.d/*.conf
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Default port for Cloud Run is 8080, but it will be overridden by the $PORT env var
ENV PORT=8080
ENV BACKEND_URL=http://backend:8080

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
