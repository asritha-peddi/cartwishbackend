pipeline {
    agent any

    environment {
        IMAGE_NAME = "cartwish-backend"
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/asritha-peddi/cartwishbackend.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat "docker build -t %IMAGE_NAME%:latest ."
            }
        }

        stage('Load Image into Minikube') {
            steps {
                bat "minikube image load %IMAGE_NAME%:latest"
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat "kubectl rollout restart deployment/cartwish-backend"
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check logs above.'
        }
    }
}
