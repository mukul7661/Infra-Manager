FROM ubuntu:focal

ENV DEBIAN_FRONTEND=noninteractive


RUN apt-get update && \
    apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs git awscli && \
    apt-get clean

RUN curl https://baltocdn.com/helm/signing.asc | apt-key add - && \
    apt-get install -y apt-transport-https && \
    echo "deb https://baltocdn.com/helm/stable/debian/ all main" | tee /etc/apt/sources.list.d/helm-stable-debian.list && \
    apt-get update && \
    apt-get install -y helm && \
    apt-get clean

WORKDIR /home/app

# RUN chmod 600 /home/.kube/config


COPY index.js index.js
COPY package*.json .
COPY utils/ utils/

RUN npm install

ARG AWS_KEY
ARG AWS_SECRET_KEY
ARG AWS_REGION
ARG EKS_CLUSTER_NAME

RUN aws configure set aws_access_key_id $AWS_KEY \
&& aws configure set aws_secret_access_key $AWS_SECRET_KEY \
&& aws configure set default.region $AWS_REGION

RUN aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $AWS_REGION

RUN chmod 600 ~/.kube/config

CMD ["node", "index.js"]


