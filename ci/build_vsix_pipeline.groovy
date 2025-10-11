pipeline {
    agent any

    environment {
        PAT = credentials('pat-token')         // external repo token
        BRANCH = 'main'                        // branch in TaskBoard
        TASKBOARD_REPO = 'https://github.com/jagan786786/TaskBoard.git'
        EXTERNAL_REPO = 'https://github.com/jagan786786/task_board_version.git'
    }

    stages {
        stage('Checkout TaskBoard') {
            steps {
                echo "Checking out TaskBoard repo..."
                git branch: "${BRANCH}", url: "${TASKBOARD_REPO}", credentialsId: 'github-token'
            }
        }

        stage('Prepare Task Version Folder') {
            steps {
                script {
                    def folder = 'task_version'
                    if (!fileExists(folder)) {
                        echo "Creating folder ${folder}"
                        sh "mkdir -p ${folder}"
                    } else {
                        echo "${folder} already exists"
                    }
                }
            }
        }

        stage('Generate Version File') {
            steps {
                script {
                    def timestamp = sh(script: "date +%Y%m%d_%H%M%S", returnStdout: true).trim()
                    def versionFile = "task_version/task_version_${timestamp}.txt"
                    sh "echo 'This is a Jenkins-generated version file' > ${versionFile}"
                    echo "Created ${versionFile}"
                }
            }
        }

       stage('Commit Task Version to Test Repo') {
    steps {
        bat '''
            git config user.name "jenkins-bot"
            git config user.email "jenkins-bot@example.com"
            
            git add task_version/*
            if not git diff --cached --quiet (
                git commit -m "chore: add task version files"
                git push origin HEAD:%BRANCH%
            ) else (
                echo No new version files to commit
            )
        '''
    }
}

        stage('Push Latest Version to External Repo') {
            steps {
                script {
                    // Clone external repo
                    def repoFolder = 'external_repo'
                    sh "git clone https://x-access-token:${PAT}@${EXTERNAL_REPO.split('https://')[1]} ${repoFolder} || mkdir -p ${repoFolder} && cd ${repoFolder} && git init && git remote add origin ${EXTERNAL_REPO}"

                    // Create build_task_version folder if missing
                    sh "mkdir -p ${repoFolder}/build_task_version"

                    // Copy latest version file
                    def latestFile = sh(script: "ls -t task_version/* | head -n1", returnStdout: true).trim()
                    sh "cp ${latestFile} ${repoFolder}/build_task_version/"

                    // Commit & push to external repo
                    dir("${repoFolder}") {
                        sh '''
                            git config user.name "jenkins-bot"
                            git config user.email "jenkins-bot@example.com"

                            git add build_task_version/*
                            if ! git diff --cached --quiet; then
                                git commit -m "chore: add latest task version"
                                git branch -M main || true
                                git push -u origin main
                            else
                                echo "No changes to commit in external repo"
                            fi
                        '''
                    }
                }
            }
        }
    }
}
