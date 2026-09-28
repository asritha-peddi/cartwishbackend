pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        IMAGE_NAME = 'cartwish-backend'
        DEPLOYMENT_NAME = 'cartwish-backend'
    }

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/asritha-peddi/cartwishbackend.git'
            }
        }

        stage('Verify Tools') {
            steps {
                bat 'docker --version'
                bat 'kubectl version --client'
                bat 'minikube version'
                bat 'node --version'
                bat 'npm --version'
            }
        }

        stage('Install and Validate Backend') {
            steps {
                bat 'npm ci'
                bat 'node --check index.js'
            }
        }

        stage('Build Docker Image') {
            steps {
                bat 'docker build -t %IMAGE_NAME%:latest .'
            }
        }

        stage('Load Image into Minikube') {
            steps {
                bat 'minikube image load %IMAGE_NAME%:latest'
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                bat 'kubectl rollout restart deployment/%DEPLOYMENT_NAME%'
                bat 'kubectl rollout status deployment/%DEPLOYMENT_NAME% --timeout=120s'
            }
        }
    }

    post {
        success {
            echo 'Backend pipeline completed successfully.'
        }

        failure {
            echo 'Backend pipeline failed. Review the stage logs.'
        }

        always {
            bat 'kubectl get pods || exit 0'
        }
    }
}