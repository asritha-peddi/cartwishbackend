# CartWish Backend

Backend service for the CartWish e-commerce application, built with Node.js, Express and MongoDB. This repository also contains the Docker, Kubernetes, Helm, Jenkins, Argo CD and Ansible configurations used for local DevOps automation.

## Application Features

- User registration and authentication
- Product and category management
- Shopping cart and order operations
- Product and profile image handling
- JWT-based authentication
- MongoDB persistence using Mongoose
- Kubernetes health and readiness endpoints

## Technology Stack

| Area | Technology |
| --- | --- |
| Runtime | Node.js |
| API framework | Express |
| Database | MongoDB and Mongoose |
| Authentication | JWT and bcrypt |
| Containerization | Docker |
| Orchestration | Kubernetes and Minikube |
| Packaging | Helm |
| CI/CD | Jenkins |
| GitOps | Argo CD |
| Configuration | Ansible and Jinja2 |

## Repository Structure

- `ansible/` - Ansible playbooks and Jinja2 templates
- `argocd/` - Argo CD Application manifest
- `cartwish-backend-chart/` - Backend Helm chart
- `db/` - MongoDB connection configuration
- `k8s/` - Raw Kubernetes manifests
- `middleware/` - Authentication middleware
- `models/` - Mongoose models
- `routes/` - Express API routes
- `upload/` - Application image directories
- `Dockerfile` - Backend container definition
- `Jenkinsfile` - Jenkins deployment pipeline
- `index.js` - Application entry point

## Environment Variables

Create a local `.env` file. Do not commit it to Git.

```env
PORT=5000
DATABASE=your_mongodb_connection_string
JWTSECRET=your_jwt_secret
```

## Run Locally

```bash
npm install
node index.js
```

The API runs at `http://localhost:5000`.

Health endpoints:

- `GET /health` confirms that the Node.js process is running.
- `GET /ready` confirms that MongoDB is connected.

## Docker

```bash
docker build -t cartwish-backend:latest .
docker run --env-file .env -p 5000:5000 cartwish-backend:latest
```

Test:

```bash
curl http://localhost:5000/health
```

## Kubernetes

```bash
minikube start
minikube image load cartwish-backend:latest
```

Create the required Secret:

```bash
kubectl create secret generic cartwish-backend-secret --from-literal=DATABASE="your_mongodb_connection_string" --from-literal=JWTSECRET="your_jwt_secret"
```

Deploy:

```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/backend-service.yaml
kubectl rollout status deployment/cartwish-backend
```

The Deployment includes two replicas, health probes, Secret-based configuration and CPU/memory controls.

## Helm

```bash
helm lint ./cartwish-backend-chart
helm template cartwish-backend ./cartwish-backend-chart
helm upgrade --install cartwish-backend ./cartwish-backend-chart
```

## Jenkins Pipeline

The Jenkins pipeline:

1. Checks out the `main` branch.
2. Verifies Docker, kubectl, Minikube, Node.js and npm.
3. Installs dependencies and validates backend syntax.
4. Builds the Docker image.
5. Loads the image into Minikube.
6. Restarts the Kubernetes Deployment.
7. Waits for the rollout to complete.

## Argo CD

The manifest is located at `argocd/cartwish-backend-argocd-app.yaml`.

It tracks the `main` branch and deploys the backend Helm chart with automated synchronization, pruning and self-healing.

```bash
kubectl apply -f argocd/cartwish-backend-argocd-app.yaml
```

## Troubleshooting

```bash
kubectl get pods
kubectl describe pod POD_NAME
kubectl logs POD_NAME
kubectl get events
kubectl rollout status deployment/cartwish-backend
kubectl rollout undo deployment/cartwish-backend
```

Issues addressed during development included Docker build-context problems, MongoDB ObjectId errors, backend exception logging and Kubernetes deployment troubleshooting.

## Related Repository

Frontend: https://github.com/asritha-peddi/Cartwish
