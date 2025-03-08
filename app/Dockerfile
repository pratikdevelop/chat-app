FROM node:18
WORKDIR /app
COPY package.json ./app
RUN ls
RUN ulimit  1024
RUN npm install --force  
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
COPY . .
RUN npm start