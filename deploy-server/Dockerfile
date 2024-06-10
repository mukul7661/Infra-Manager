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

ARG AWS_KEY
ARG AWS_SECRET_KEY
ARG AWS_REGION
ARG EKS_CLUSTER_NAME


RUN curl -LO https://dl.k8s.io/release/v1.29.5/bin/linux/amd64/kubectl

RUN install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

RUN apt-get -y install python3

RUN ln -s /usr/bin/python3 /usr/bin/python

RUN apt install -y unzip

RUN apt install python3.8-venv -y

RUN curl "https://s3.amazonaws.com/aws-cli/awscli-bundle-1.29.53.zip" -o "awscli-bundle.zip"

RUN unzip awscli-bundle.zip

RUN ./awscli-bundle/install -i /usr/local/aws -b /usr/local/bin/aws

RUN aws configure set aws_access_key_id $AWS_KEY \
&& aws configure set aws_secret_access_key $AWS_SECRET_KEY \
&& aws configure set default.region $AWS_REGION

RUN aws eks update-kubeconfig --name $EKS_CLUSTER_NAME --region $AWS_REGION

# RUN chmod 600 ~/.kube/config

WORKDIR /home/app

COPY index.js index.js
COPY package*.json .
COPY utils/ utils/

RUN npm install

CMD ["node", "index.js"]


