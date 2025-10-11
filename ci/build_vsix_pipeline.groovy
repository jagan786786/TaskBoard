pipeline {
    agent any

    environment {
        GITHUB_TOKEN = credentials('github-token')  // test repo
        PAT = credentials('pat-token')              // external repo
        BRANCH = 'main'                             // branch in TaskBoard repo
    }

    triggers {
        pollSCM('* * * * *')  // optional; you can use GitHub webhook instead
    }

    stages {
        stage('Checkout Source') {
            steps {
                echo "Checking out source branch ${BRANCH}"
                git branch: "${BRANCH}", url: 'https://github.com/jagan786786/TaskBoard.git', credentialsId: 'github-token'
            }
        }

        stage('Prepare Version Folder') {
            steps {
                dir('task_version') {
                    sh '''
                        mkdir -p task_version
                        echo "Preparing version folder"
                    '''
                }
            }
        }

        stage('Build / Generate Task Version') {
            steps {
                dir('task_version') {
                    sh '''
                        # Example: create a dummy version file
                        VERSION_FILE="task_version_$(date +%Y%m%d_%H%M%S).txt"
                        echo "This is a test version file for Jenkins build" > $VERSION_FILE
                        ls -l
                    '''
                }
            }
        }

        stage('Commit Task Version to Test Repo') {
            steps {
                sh '''
                    git config user.name "jenkins-bot"
                    git config user.email "jenkins-bot@example.com"

                    git add task_version/*
                    if ! git diff --cached --quiet; then
                        git commit -m "chore: add task version files"
                        git push origin HEAD:${BRANCH}
                    else
                        echo "No new version files to commit"
                    fi
                '''
            }
        }

        stage('Push Latest Version to External Repo') {
            steps {
                bat '''
                    git config --global user.name "jenkins-bot"
                    git config --global user.email "jenkins-bot@example.com"

                    echo "Cloning external repo..."
                    git clone https://x-access-token:${PAT}@github.com/jagan786786/task_board_version.git external_repo
                    mkdir -p external_repo/build_task_version

                    # Copy latest version file from task_version folder
                    LATEST_FILE=$(ls -t task_version/* | head -n1)
                    BASENAME=$(basename "$LATEST_FILE")
                    cp "$LATEST_FILE" "external_repo/build_task_version/$BASENAME"

                    cd external_repo
                    git add "build_task_version/$BASENAME"
                    if ! git diff --cached --quiet; then
                        git commit -m "chore: add latest task version $BASENAME"
                        git branch -M main || true
                        git push -u origin main
                    else
                        echo "No changes to commit in external repo"
                    fi
                '''
            }
        }

        stage('Bump Version') {
            steps {
                dir('.') {
                    sh '''
                        # Increment a simple version.txt file for demo purposes
                        VERSION_FILE="version.txt"
                        if [ ! -f "$VERSION_FILE" ]; then
                            echo "0.0.0" > $VERSION_FILE
                        fi
                        IFS='.' read -r major minor patch <<< "$(cat $VERSION_FILE)"
                        patch=$((patch + 1))
                        echo "$major.$minor.$patch" > $VERSION_FILE
                        git add $VERSION_FILE
                        git commit -m "chore: bump version to $(cat $VERSION_FILE)" || echo "No changes"
                        git push origin HEAD:${BRANCH}
                    '''
                }
            }
        }
    }
}
