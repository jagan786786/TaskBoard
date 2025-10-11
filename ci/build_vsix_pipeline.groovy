pipeline {
    agent any

    environment {
        GITHUB_TOKEN = credentials('github-token')
        PAT = credentials('pat-token')
        BRANCH = 'main'
    }

    stages {
        stage('Hello') {
            steps {
                echo "✅ Custom Jenkins pipeline is working!"
            }
        }
    }
}
