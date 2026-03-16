pipeline {
    agent any
    
    environment {
        // Docker Hub config
        DOCKER_HUB_USER = 'hyperx253'
        BACKEND_IMAGE = "${DOCKER_HUB_USER}/flavorfusion-backend:${BUILD_NUMBER}"
        FRONTEND_IMAGE = "${DOCKER_HUB_USER}/flavorfusion-frontend:${BUILD_NUMBER}"
        BACKEND_LATEST = "${DOCKER_HUB_USER}/flavorfusion-backend:latest"
        FRONTEND_LATEST = "${DOCKER_HUB_USER}/flavorfusion-frontend:latest"
    }
    
    stages {
        stage('GitHub Pull') {
            steps {
                echo '📥 GitHub se code le raha hoon...'
                git 'https://github.com/muddasir-x/food-devops-project.git'
            }
        }
        
        stage('Docker Build') {
            parallel {
                stage('Build Backend') {
                    steps {
                        dir('backend') {
                            sh "docker build -t ${BACKEND_IMAGE} ."
                            sh "docker tag ${BACKEND_IMAGE} ${BACKEND_LATEST}"
                        }
                    }
                }
                
                stage('Build Frontend') {
                    steps {
                        dir('frontend') {
                            sh "docker build -t ${FRONTEND_IMAGE} ."
                            sh "docker tag ${FRONTEND_IMAGE} ${FRONTEND_LATEST}"
                        }
                    }
                }
            }
        }
        
        stage('Docker Push') {
            steps {
                script {
                    docker.withRegistry('', 'docker-hub-credentials') {
                        sh "docker push ${BACKEND_IMAGE}"
                        sh "docker push ${BACKEND_LATEST}"
                        sh "docker push ${FRONTEND_IMAGE}"
                        sh "docker push ${FRONTEND_LATEST}"
                    }
                }
                echo "✅ Images Docker Hub par push ho gayin!"
            }
        }
        
        stage('Kubernetes Deploy') {
            steps {
                echo '🚀 Kubernetes deploy kar raha hoon...'
                
                // Update images in k8s files
                sh "sed -i 's|image:.*backend.*|image: ${BACKEND_IMAGE}|g' kubernetes/backend-deployment.yaml"
                sh "sed -i 's|image:.*frontend.*|image: ${FRONTEND_IMAGE}|g' kubernetes/frontend-deployment.yaml"
                
                // Deploy to Kubernetes
                sh "kubectl apply -f kubernetes/namespace.yaml"
                sh "kubectl apply -f kubernetes/backend-deployment.yaml"
                sh "kubectl apply -f kubernetes/frontend-deployment.yaml"
                sh "kubectl apply -f kubernetes/service.yaml"
                
                // Check status
                sh "kubectl get pods -n food-delivery"
            }
        }
        
        stage('Verify Deploy') {
            steps {
                echo '✅ Sab kuch sahi hai? Check karta hoon...'
                sh "kubectl wait --for=condition=ready pod -l app=flavorfusion -n food-delivery --timeout=60s"
            }
        }
    }
    
    post {
        success {
            echo '🎉 GitHub Push → Jenkins → Docker → Kubernetes Done!'
            echo "Frontend: http://frontend-service"
            echo "Backend: http://backend-service:5000"
        }
        failure {
            echo '❌ Kuch gadbad ho gayi!'
        }
    }
}
