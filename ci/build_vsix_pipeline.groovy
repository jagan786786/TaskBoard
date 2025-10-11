pipeline {
    agent any

    environment {
        GITHUB_TOKEN = credentials('github-token')
        PAT = credentials('pat-token')
        BRANCH = 'main'
    }

    triggers {
        pollSCM('* * * * *')
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
                bat '''
                    mkdir task_version
                    echo Preparing version folder
                '''
            }
        }

        stage('Build / Generate Task Version') {
            steps {
                dir('task_version') {
                    bat '''
                        set VERSION_FILE=task_version_%date:~-4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%%time:~6,2%.txt
                        echo This is a test version file for Jenkins build > %VERSION_FILE%
                        dir
                    '''
                }
            }
        }

        stage('Commit Task Version to Test Repo') {
            steps {
                bat '''
                    git config user.name "jenkins-bot"
                    git config user.email "jenkins-bot@example.com"
                    git add task_version\\*
                    git diff --cached --quiet || (
                        git commit -m "chore: add task version files"
                        git push origin HEAD:%BRANCH%
                    )
                '''
            }
        }

        stage('Push Latest Version to External Repo') {
            steps {
                bat '''
                    git config --global user.name "jenkins-bot"
                    git config --global user.email "jenkins-bot@example.com"

                    echo Cloning external repo...
                    git clone https://x-access-token:%PAT%@github.com/jagan786786/task_board_version.git external_repo
                    mkdir external_repo\\build_task_version

                    for /f %%F in ('dir /b /o-d task_version') do set LATEST_FILE=%%F & goto :break
                    :break
                    copy task_version\\%LATEST_FILE% external_repo\\build_task_version\\%LATEST_FILE%

                    cd external_repo
                    git add build_task_version\\%LATEST_FILE%
                    git diff --cached --quiet || (
                        git commit -m "chore: add latest task version %LATEST_FILE%"
                        git branch -M main
                        git push -u origin main
                    )
                '''
            }
        }

        stage('Bump Version') {
            steps {
                bat '''
                    set VERSION_FILE=version.txt
                    if not exist %VERSION_FILE% echo 0.0.0 > %VERSION_FILE%

                    for /f "tokens=1-3 delims=." %%a in (%VERSION_FILE%) do (
                        set MAJOR=%%a
                        set MINOR=%%b
                        set PATCH=%%c
                    )
                    set /a PATCH+=1
                    echo %MAJOR%.%MINOR%.%PATCH% > %VERSION_FILE%

                    git add %VERSION_FILE%
                    git diff --cached --quiet || (
                        git commit -m "chore: bump version to %MAJOR%.%MINOR%.%PATCH%"
                        git push origin HEAD:%BRANCH%
                    )
                '''
            }
        }
    }
}
