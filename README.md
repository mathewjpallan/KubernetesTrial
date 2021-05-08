# KubernetesTrial
Trying out Kubernetes(K8s) on a local workstation

1. Install docker

2. Setup minikube on your workstation by following the steps in https://minikube.sigs.k8s.io/docs/start/

```
The below steps were tried on a Dell Precision laptop running Linux Mint 20.1 to run minikube on docker.
 
 curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

 sudo install minikube-linux-amd64 /usr/local/bin/minikube

 minikube --memory 8192 --cpus 4  start

At this point we have a functional K8s cluster with 1 node running on the workstation and we can use the Kubernetes command-line tool(kubectl) to interact with the K8s cluster

Eg.
kubectl get pods --all-namespaces
kubectl get all --all-namespaces
```
