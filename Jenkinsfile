pipeline {
    agent any
    
    environment {
        DOCKER_HUB_USER = 'hyperx253'
        BACKEND_IMAGE = "${DOCKER_HUB_USER}/flavorfusion-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKER_HUB_USER}/flavorfusion-frontend:${BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout from main') {
            steps {
                // Explicitly checkout main branch
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: 'main']],
                    userRemoteConfigs: [[url: 'https://github.com/muddasir-x/food-devops-project.git']]
                ])
                echo '✅ Code checkout ho gaya'
                sh 'git branch'  // Check konsi branch checkout hui
            }
        }
        
        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'ls -la'
                    sh "docker build -t ${BACKEND_IMAGE} ."
                    sh "docker tag ${BACKEND_IMAGE} ${DOCKER_HUB_USER}/flavorfusion-backend:latest"
                }
            }
        }
        
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'ls -la'
                    sh "docker build -t ${FRONTEND_IMAGE} ."
                    sh "docker tag ${FRONTEND_IMAGE} ${DOCKER_HUB_USER}/flavorfusion-frontend:latest"
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('', 'docker-hub-credentials') {
                        sh "docker push ${BACKEND_IMAGE}"
                        sh "docker push ${DOCKER_HUB_USER}/flavorfusion-backend:latest"
                        sh "docker push ${FRONTEND_IMAGE}"
                        sh "docker push ${DOCKER_HUB_USER}/flavorfusion-frontend:latest"
                    }
                }
            }
        }
        
        stage('Deploy to Kubernetes') {
            steps {
                sh 'ls -la kubernetes/'
                sh "kubectl apply -f kubernetes/namespace.yaml || true"
                sh "kubectl apply -f kubernetes/backend-deployment.yaml"
                sh "kubectl apply -f kubernetes/frontend-deployment.yaml"
                sh "kubectl apply -f kubernetes/service.yaml"
            }
        }
    }
    
    post {
        success {
            echo '🎉 Pipeline successful!'
        }
        failure {
            echo '❌ Pipeline failed!'
        }
    }
}
