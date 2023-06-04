FROM node:latest as build-stage
WORKDIR /app
COPY package.json ./
RUN npm install --force  
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
COPY . .
RUN npm build
FROM nginx:latest

COPY --from=build-stage /bezkoder-ui/build /usr/share/nginx/html
EXPOSE 80

CMD nginx -g 'daemon off;'