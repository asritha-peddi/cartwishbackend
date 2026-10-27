pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    environment {
        IMAGE_NAME = "cartwish-backend"
        EXPECTED_CLUSTER_UID = "34cb2996-f9ca-49d2-bcc7-811de319af63"

        DOCKER = "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe"
        KUBECTL = "C:\\Program Files\\Docker\\Docker\\resources\\bin\\kubectl.exe"
        MINIKUBE = "C:\\Program Files\\Kubernetes\\Minikube\\minikube.exe"

        KUBECONFIG = "C:\\Users\\VENU MADHAVI\\.kube\\config"
        MINIKUBE_HOME = "C:\\Users\\VENU MADHAVI"
        USERPROFILE = "C:\\Users\\VENU MADHAVI"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Verify Cluster Identity') {
            steps {
                script {
                    def clusterUid = bat(
                        script: '@"%KUBECTL%" --context=minikube get namespace kube-system -o jsonpath="{.metadata.uid}"',
                        returnStdout: true
                    ).trim()

                    echo "Jenkins cluster UID: ${clusterUid}"

                    if (clusterUid != env.EXPECTED_CLUSTER_UID) {
                        error('Cluster UID mismatch.')
                    }
                }
            }
        }

        stage('Set Image Tag') {
            steps {
                script {
                    def shortCommit = bat(
                        script: '@git rev-parse --short=12 HEAD',
                        returnStdout: true
                    ).trim()

                    env.IMAGE_TAG = "build-${env.BUILD_NUMBER}-${shortCommit}"
                    currentBuild.description = env.IMAGE_TAG
                }

                echo "Building ${env.IMAGE_NAME}:${env.IMAGE_TAG}"
            }
        }

        stage('Build Docker Image') {
            steps {
                bat '"%DOCKER%" build -t "%IMAGE_NAME%:%IMAGE_TAG%" .'
            }
        }

        stage('Export Image Archive') {
            steps {
                bat '''
@echo on
if exist backend-image.tar del /f backend-image.tar
"%DOCKER%" image save --output "%WORKSPACE%\\backend-image.tar" "%IMAGE_NAME%:%IMAGE_TAG%"
if errorlevel 1 exit /b 1
'''
            }
        }

        stage('Trivy Security Scan') {
            steps {
                bat '''
@echo off
if exist trivy-report.txt del /f trivy-report.txt

"%DOCKER%" run --rm ^
  --mount "type=bind,source=%WORKSPACE%,target=/scan" ^
  --mount "type=volume,source=cartwish-backend-trivy-cache,target=/root/.cache/trivy" ^
  aquasec/trivy:0.76.1 image ^
  --input /scan/backend-image.tar ^
  --scanners vuln ^
  --severity HIGH,CRITICAL ^
  --exit-code 1 ^
  --format table ^
  --output /scan/trivy-report.txt ^
  --no-progress ^
  --timeout 10m

set "SCAN_EXIT=%ERRORLEVEL%"
if exist trivy-report.txt type trivy-report.txt
exit /b %SCAN_EXIT%
'''
            }
            post {
                always {
                    archiveArtifacts(
                        artifacts: 'trivy-report.txt',
                        allowEmptyArchive: true,
                        fingerprint: true
                    )
                }
            }
        }

        stage('Load Image into Minikube') {
            steps {
                bat '''
@echo on
"%MINIKUBE%" -p minikube image load --overwrite=true "%WORKSPACE%\\backend-image.tar"
if errorlevel 1 exit /b 1
'''
            }
        }

        stage('Verify Image in Minikube') {
            steps {
                script {
                    def imageList = bat(
                        script: '@"%MINIKUBE%" -p minikube image ls',
                        returnStdout: true
                    ).trim()

                    writeFile(
                        file: 'minikube-images.txt',
                        text: imageList + '\n'
                    )

                    echo "Minikube images:\n${imageList}"

                    def expectedImage = (
                        env.IMAGE_NAME + ':' + env.IMAGE_TAG
                    ).toString()

                    def found = false

                    for (def line : imageList.readLines()) {
                        def normalized = line.trim()
                            .replaceFirst('^docker\\.io/', '')
                            .replaceFirst('^library/', '')

                        if (normalized == expectedImage) {
                            found = true
                        }
                    }

                    if (!found) {
                        error("Image missing from Minikube: ${expectedImage}")
                    }

                    echo "Verified image: ${expectedImage}"
                }
            }
        }

        stage('Save Image Reference') {
            steps {
                writeFile(
                    file: 'image-reference.txt',
                    text: "${env.IMAGE_NAME}:${env.IMAGE_TAG}\n"
                )

                archiveArtifacts(
                    artifacts: 'image-reference.txt,minikube-images.txt',
                    fingerprint: true
                )
            }
        }
    }

    post {
        success {
            echo "Image verified in Minikube: ${env.IMAGE_NAME}:${env.IMAGE_TAG}"

            bat '''
@echo off
if exist backend-image.tar del /f backend-image.tar
'''
        }

        failure {
            echo 'Backend pipeline failed. Review the first error in Console Output.'
        }
    }
}