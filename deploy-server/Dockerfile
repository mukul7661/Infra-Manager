FROM ubuntu:focal

RUN apt-get update
RUN apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs
RUN apt-get install -y git
RUN apt-get install -y awscli

WORKDIR /home/app

COPY index.js index.js
COPY package*.json .

COPY utils/ utils/

RUN npm install

# Add the aws credentials to the environment


CMD ["node", "index.js"]
