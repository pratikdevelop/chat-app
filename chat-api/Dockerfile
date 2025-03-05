FROM node:latest 
RUN mkdir /app
WORKDIR  /app
COPY package.json ./
RUN npm install --force  
COPY . .
EXPOSE 8000
CMD [ "npm", "start" ]
# docker-machine create -d virtualbox --virtualbox-memory=4096 \--virtualbox-cpu-count=4 --virtualbox-disk-size=40960 \--virtualbox-no-vtx-check default