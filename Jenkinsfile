pipeline {
  agent any

  environment {
    // Build-time environment
    NODE_ENV = 'production'
  }

  stages {
    stage('Checkout') {
      steps {
        // Pull from the same repo the job is configured on
        checkout scm
      }
    }

    stage('Start Server (Test)') {
      steps {
        sh '''
          chmod +x setup.sh start.sh
          ./setup.sh
          ./start.sh &
        '''
      }
    }
  }

  post {
    success {
      echo '✅ Build and packaging succeeded!'
    }
    failure {
      echo '❌ Build failed!'
    }
  }
}
