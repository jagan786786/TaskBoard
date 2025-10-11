pipeline {
    agent any

    environment {
        PATH = "C:\\Windows\\System32;C:\\Windows;E:\\Git\\bin;E:\\Git\\cmd;E:\\Git\\usr\\bin"
        GITHUB_TOKEN = credentials('github-token')  // internal repo
        PAT = credentials('pat-token')              // external repo
        BRANCH = 'main'
    }

    triggers {
        pollSCM('* * * * *')  // optional; can use GitHub webhook instead
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
                    if not exist task_version mkdir task_version
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

        stage('Commit Task Version to Main Repo') {
            steps {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                    bat '''
                        git config user.name "jenkins-bot"
                        git config user.email "jenkins-bot@example.com"

                        git remote set-url origin https://x-access-token:%GITHUB_TOKEN%@github.com/jagan786786/TaskBoard.git

                        git add task_version\\*
                        git diff --cached --quiet || (
                            git commit -m "chore: add task version files"
                            git push origin HEAD:%BRANCH%
                        )
                    '''
                }
            }
        }

        stage('Push Latest Version to External Repo') {
            steps {
                withCredentials([string(credentialsId: 'pat-token', variable: 'PAT')]) {
                    bat '''
                        git config --global user.name "jenkins-bot"
                        git config --global user.email "jenkins-bot@example.com"

                        REM Clone external repo if it doesn't exist
                        if not exist external_repo (
                            git clone https://x-access-token:%PAT%@github.com/jagan786786/task_board_version.git external_repo
                        ) else (
                            cd external_repo
                            git pull origin main
                            cd ..
                        )

                        REM Ensure task_version folder exists in external repo
                        if not exist external_repo\\task_version mkdir external_repo\\task_version

                        REM Get the latest version file from main repo
                        for /f %%F in ('dir /b /o-d task_version') do set LATEST_FILE=%%F & goto :break
                        :break

                        REM Copy latest version file into external repo's task_version
                        copy task_version\\%LATEST_FILE% external_repo\\task_version\\%LATEST_FILE%

                        REM Commit and push changes to external repo
                        cd external_repo
                        git add task_version\\%LATEST_FILE%
                        git diff --cached --quiet || (
                            git commit -m "chore: add latest task version %LATEST_FILE%"
                            git push origin main
                        )
                        cd ..
                    '''
                }
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
                    )
                    
                    REM Pull remote changes first
                    git pull --rebase origin %BRANCH%
                    
                    REM Push after rebasing
                    git push origin %BRANCH%
                '''
            }
        }
    }
}
