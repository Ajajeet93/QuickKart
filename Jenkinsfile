// =============================================================================
// Jenkinsfile — QuickKart CI/CD Pipeline
// INT377 DevOps Project — Phase 6: Jenkins
//
// Triggered on every git push to 'main' branch via GitHub webhook.
// 10 Stages:
//   1.  Checkout            — clone from GitHub
//   2.  Install             — npm ci for all 3 apps (parallel)
//   3.  Lint                — ESLint (fails build on any error)
//   4.  Security Audit      — npm audit --audit-level=high (aborts on critical CVE)
//   5.  Build Client        — Vite production build
//   6.  Build Admin         — Vite production build
//   7.  Docker Build        — versioned image quickkart-server:${BUILD_NUMBER}
//   8.  Deploy Frontend     — aws s3 sync + CloudFront invalidation
//   9.  Deploy Backend      — SSH into EC2, replace Docker container
//   10. Health Check        — curl /api/health must return 200
//
// Required Jenkins Credentials:
//   - AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY (AWS deployment)
//   - EC2_SSH_KEY (SSH private key for EC2)
//   - EC2_HOST (EC2 public IP/hostname)
// =============================================================================

pipeline {
    agent {
        label 'built-in'
    }


    environment {
        // Project metadata
        APP_NAME     = 'quickkart'
        NODE_VERSION = '20'
        AWS_REGION   = 'ap-south-1'

        // Docker image tag — includes build number for traceability
        IMAGE_TAG    = "${APP_NAME}-server:${BUILD_NUMBER}"
        LATEST_TAG   = "${APP_NAME}-server:latest"

        // AWS credentials from Jenkins credential store (never hardcoded)
        AWS_ACCESS_KEY_ID     = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')

        // S3 bucket names — set these after terraform apply
        CLIENT_S3_BUCKET = "${APP_NAME}-client"
        ADMIN_S3_BUCKET  = "${APP_NAME}-admin"

        // CloudFront distribution IDs — set after terraform apply
        CLIENT_CF_DIST_ID = credentials('CLIENT_CF_DIST_ID')
        ADMIN_CF_DIST_ID  = credentials('ADMIN_CF_DIST_ID')

        // EC2 connection
        EC2_HOST = credentials('EC2_HOST')
        EC2_USER = 'ec2-user'
    }

    options {
        // Fail build if it runs longer than 30 minutes
        timeout(time: 30, unit: 'MINUTES')
        // Keep last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Don't run concurrent builds on the same branch
        disableConcurrentBuilds()
        // Add timestamps to log output
        timestamps()
    }

    stages {

        // ── Stage 1: Checkout ─────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "📥 Stage 1: Checking out DevOps scripts..."
                checkout scm
                
                echo "📥 Cloning main QuickKart application code..."
                // The application code is already present via checkout scm
                
                sh 'git log --oneline -5'
            }
        }

        // ── Stage 2: Install Dependencies (parallel) ──────────────────────
        stage('Install') {
            parallel {
                stage('Install Server') {
                    steps {
                        echo "📦 Installing server dependencies..."
                        dir('server') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Install Client') {
                    steps {
                        echo "📦 Installing client dependencies..."
                        dir('client') {
                            sh 'npm ci'
                        }
                    }
                }
                stage('Install Admin') {
                    steps {
                        echo "📦 Installing admin dependencies..."
                        dir('admin') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }

        // ── Stage 3: Lint ──────────────────────────────────────────────────
        stage('Lint') {
            parallel {
                stage('Lint Server') {
                    steps {
                        dir('server') {
                            sh 'npx eslint . --ext .js --max-warnings=0'
                        }
                    }
                }
                stage('Lint Client') {
                    steps {
                        dir('client') {
                            sh 'npx eslint . --ext .js,.jsx --max-warnings=0'
                        }
                    }
                }
                stage('Lint Admin') {
                    steps {
                        dir('admin') {
                            sh 'npx eslint . --ext .js,.jsx --max-warnings=0'
                        }
                    }
                }
            }
        }

        // ── Stage 4: Security Audit ────────────────────────────────────────
        // Any critical CVE aborts the entire pipeline before deployment
        stage('Security Audit') {
            steps {
                echo "🔒 Stage 4: Running npm security audit..."
                script {
                    def serverAudit  = sh(script: 'cd server && npm audit --audit-level=high', returnStatus: true)
                    def clientAudit  = sh(script: 'cd client && npm audit --audit-level=high', returnStatus: true)
                    def adminAudit   = sh(script: 'cd admin  && npm audit --audit-level=high', returnStatus: true)

                    if (serverAudit != 0 || clientAudit != 0 || adminAudit != 0) {
                        error("❌ CRITICAL: npm audit found high/critical CVEs. Deployment aborted.")
                    }
                    echo "✅ Security audit passed — no critical vulnerabilities."
                }
            }
        }

        // ── Stage 5: Build Client ──────────────────────────────────────────
        stage('Build Client') {
            steps {
                echo "⚙️  Stage 5: Building React customer frontend..."
                dir('client') {
                    withEnv(["VITE_API_URL=http://${EC2_HOST}:5000"]) {
                        sh 'npm run build'
                    }
                }
                echo "✅ Client dist/ built successfully."
            }
        }

        // ── Stage 6: Build Admin ───────────────────────────────────────────
        stage('Build Admin') {
            steps {
                echo "⚙️  Stage 6: Building React admin dashboard..."
                dir('admin') {
                    withEnv(["VITE_API_URL=http://${EC2_HOST}:5000"]) {
                        sh 'npm run build'
                    }
                }
                echo "✅ Admin dist/ built successfully."
            }
        }

        // ── Stage 7: Docker Build ──────────────────────────────────────────
        stage('Docker Build') {
            steps {
                echo "🐳 Stage 7: Building Docker image ${IMAGE_TAG}..."
                dir('server') {
                    sh "docker build -t ${IMAGE_TAG} -t ${LATEST_TAG} ."
                }
                sh "docker images | grep ${APP_NAME}"
                echo "✅ Docker image built: ${IMAGE_TAG}"
            }
        }

        // ── Stage 8: Deploy Frontend ───────────────────────────────────────
        stage('Deploy Frontend') {
            steps {
                echo "☁️  Stage 8: Deploying frontends to S3 + CloudFront..."

                // Sync client build to S3
                sh """
                    aws s3 sync client/dist/ s3://${CLIENT_S3_BUCKET}/ \
                        --region ${AWS_REGION} \
                        --delete \
                        --cache-control "max-age=31536000,public,immutable" \
                        --exclude "index.html"

                    aws s3 cp client/dist/index.html s3://${CLIENT_S3_BUCKET}/index.html \
                        --region ${AWS_REGION} \
                        --cache-control "no-cache,no-store,must-revalidate"
                """

                // Sync admin build to S3
                sh """
                    aws s3 sync admin/dist/ s3://${ADMIN_S3_BUCKET}/ \
                        --region ${AWS_REGION} \
                        --delete \
                        --cache-control "max-age=31536000,public,immutable" \
                        --exclude "index.html"

                    aws s3 cp admin/dist/index.html s3://${ADMIN_S3_BUCKET}/index.html \
                        --region ${AWS_REGION} \
                        --cache-control "no-cache,no-store,must-revalidate"
                """

                // Invalidate CloudFront cache so users get new files immediately
                sh """
                    aws cloudfront create-invalidation \
                        --distribution-id ${CLIENT_CF_DIST_ID} \
                        --paths "/*" \
                        --region ${AWS_REGION}

                    aws cloudfront create-invalidation \
                        --distribution-id ${ADMIN_CF_DIST_ID} \
                        --paths "/*" \
                        --region ${AWS_REGION}
                """

                echo "✅ Frontends deployed to S3, CloudFront cache invalidated."
            }
        }

        // ── Stage 9: Deploy Backend ────────────────────────────────────────
        stage('Deploy Backend') {
            steps {
                echo "🚀 Stage 9: Deploying backend to EC2..."
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'EC2_SSH_KEY',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    // Save Docker image as tarball and transfer to EC2
                    sh "docker save ${LATEST_TAG} | gzip > quickkart-server.tar.gz"

                    sh """
                        scp -i ${SSH_KEY} -o StrictHostKeyChecking=no \
                            quickkart-server.tar.gz \
                            ${EC2_USER}@${EC2_HOST}:/tmp/
                    """

                    // SSH into EC2: load image, stop old container, start new one
                    sh """
                        ssh -i ${SSH_KEY} -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            # Load new image
                            docker load < /tmp/quickkart-server.tar.gz

                            # Graceful stop of old container (30s timeout)
                            docker stop quickkart-server 2>/dev/null || true
                            docker rm   quickkart-server 2>/dev/null || true

                            # Start new container
                            docker run -d \
                                --name quickkart-server \
                                --restart unless-stopped \
                                -p 5000:5000 \
                                --env-file /opt/quickkart/.env.prod \
                                ${LATEST_TAG}

                            # Cleanup old images (keep last 3)
                            docker image prune -f --filter "until=24h"
                            rm -f /tmp/quickkart-server.tar.gz
                        '
                    """
                }
                echo "✅ Backend container replaced on EC2."
            }
        }

        // ── Stage 10: Health Check ─────────────────────────────────────────
        stage('Health Check') {
            steps {
                echo "🏥 Stage 10: Verifying deployment health..."
                script {
                    // Wait up to 60s for server to become healthy
                    retry(6) {
                        sleep(10)
                        sh "curl -f -s http://${EC2_HOST}:5000/api/health | grep -q 'ok'"
                    }
                }
                echo "✅ Health check passed — /api/health returned 200 OK."
            }
        }

    }

    // ── Post-Build Actions ─────────────────────────────────────────────────
    post {
        success {
            echo """
            ╔══════════════════════════════════════════════════════╗
            ║  ✅ BUILD #${BUILD_NUMBER} SUCCESSFUL                       ║
            ║  QuickKart deployed to production                    ║
            ║  Commit: ${env.GIT_COMMIT?.take(8)}                         ║
            ╚══════════════════════════════════════════════════════╝
            """
        }
        failure {
            echo """
            ╔══════════════════════════════════════════════════════╗
            ║  ❌ BUILD #${BUILD_NUMBER} FAILED                           ║
            ║  Check logs above for the failing stage              ║
            ╚══════════════════════════════════════════════════════╝
            """
        }
        always {
            // Clean up Docker image tarball if it was created
            sh 'rm -f quickkart-server.tar.gz || true'
            // Clean workspace to save disk space
            cleanWs()
        }
    }
}
