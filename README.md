# KubernetesTrial

## Trying out Kubernetes(K8s) on a local workstation

### 1. Install docker

[Docker Engine Install](https://docs.docker.com/engine/install/)


### 2. Setup minikube on your workstation

Please follow below link to Setup Minikube.

[Minikube Setup](https://minikube.sigs.k8s.io/docs/start/) 

> The below steps were tried on a Dell Precision laptop running Linux Mint 20.1 to run minikube on docker.
```
 curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64
 sudo install minikube-linux-amd64 /usr/local/bin/minikube
 minikube start --kubernetes-version=v1.22.0 --cpus=4 --memory=8g
```
At this point we have a functional K8s cluster with 1 node running on the workstation and we can use the Kubernetes command-line tool(kubectl) to interact with the K8s cluster

```
# kubectl get pods --all-namespaces
# kubectl get all --all-namespaces
```

### 3. Create a docker image that we can use within the K8s cluster

This repo includes an echo service that can be built by the following steps

```
# cd echoservice
# docker build --tag echoservice:0.0.1 .
# minikube image load echoservice:0.0.1
```

 We have built the docker image on our local docker, but want to access the local images in minikube which uses a separate docker daemon. The cache command is necessary to make the local images available in minikube. The cache reload needs to be done when the image changes

 Here are the steps if you want to try the docker image locally outside k8s for testing

```
# docker run --rm --name echoservice -d -p 9595:9595 echoservice:0.0.1
# curl localhost:9595/echo/somestring should return somestring in the response
# docker container stop echoservice //to stop the container
```

### 4. Run the echo service in kubernetes with a nginx reverse proxy in front.

```
# cd services
# kubectl apply -f service.yaml
# kubectl apply -f proxy.yaml
```
These yamls have the K8s definitions for the echo service and nginx proxy. The echo service is run a cluster IP service which implies that it can only be accessed within the K8s cluster. The reverse proxy is run as a NodePort service and it gets a port on the minikube through which it can be accessed outside the K8s cluster.

```
# minikube ip //This prints the IP of the minikube node
# kubectl get services //This would indicate the port (in the 32000 range) that is assigned for the Nginx NodePort service
# curl minikubeip:nodeport/api/echo/teststring //This should return teststring in the response if working as expected
```

### 5. How do you monitor the cluster
We can use prometheus operator to monitor the cluster. The operator requires multiple CRDs and services to work and so it is best installed using helm charts.

Setup helm on your workstation by following the steps in
[Helm Setup Guide](https://helm.sh/docs/intro/install/).The steps involve downloading the helm binary to the /usr/local/bin folder so that it is accessible on shell.

```
# cd monitoring
# kubectl apply -f metricsserver.yaml 
```
> This (above) is an optional step and required only if you want to try HPA. The prom operators does not rely on metrics server for metrics
```
# kubectl create namespace monitoring
```
Add the Prometheus repo using Helm. And install monitoring stack.
```
# helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
# helm repo update
# helm install --namespace monitoring monitoring-stack prometheus-community/kube-prometheus-stack --version=19.2.2 -f conf.yaml
```

The stack installs grafana but it is setup as a cluster IP and we have to edit the service to make it a NodePort for accessing it outside the K8s cluster. Please note that all the monitoring components are deployed to a different namespace (monitoring) and so the namespace has to be provided while issuing kubectl commands

```
# kubectl get services -n monitoring 
```
To see the services in the monitoring namespace. Copy the name of the grafana service

```
# kubectl edit svc grafana-service-name -n monitoring 
```
> (should be monitoring-stack-grafana if you have followed above steps) 

Edit the service type from ClusterIP to NodePort and save the config  //this should be in the 3rd last line of the service config
```
# kubectl get services -n monitoring 
```
This would indicate the port (in the 32000 range) that is assigned for the Grafana NodePort service

Navigate to ```http://<minikubeip>:<nodeport> ```on the browser to see the grafana dashboards. The default credentials are admin/prom-operator

The Kubernetes/Compute Resources/Workload dashboard would show the pod CPU, mem and other metrics
Run the apache workbench to simulate some load to see a bump in CPU/mem on these services

```
# ab -c 100 -n 100000 http://<minikubeip>:<nodeport>/api/echo/testing

```