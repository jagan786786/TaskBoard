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

        stage('Generate Versioned File with Timestamp') {
            steps {
                dir('task_version') {
                    bat '''
                        REM Ensure version.txt exists to track numeric version
                        if not exist ..\\version.txt echo 0.0.0 > ..\\version.txt

                        REM Read current version
                        for /f "tokens=1-3 delims=." %%a in (..\\version.txt) do (
                            set MAJOR=%%a
                            set MINOR=%%b
                            set PATCH=%%c
                        )

                        REM Increment patch version
                        set /a PATCH+=1

                        REM Save updated version
                        echo %MAJOR%.%MINOR%.%PATCH% > ..\\version.txt

                        REM Generate timestamp
                        set HH=%time:~0,2%
                        set HH=%HH: =0%
                        set MM=%time:~3,2%
                        set SS=%time:~6,2%
                        set YYYY=%date:~-4%
                        set MM_DATE=%date:~4,2%
                        set DD=%date:~7,2%

                        REM Create unique versioned filename
                        set VERSIONED_FILE=task_version_%MAJOR%.%MINOR%.%PATCH%_%YYYY%%MM_DATE%%DD%_%HH%%MM%%SS%.txt
                        echo This is a test version file for Jenkins build > %VERSIONED_FILE%
                        echo Created file: %VERSIONED_FILE%
                    '''
                }
            }
        }

        stage('Commit to Main Repo') {
            steps {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                    bat '''
                        git config user.name "jenkins-bot"
                        git config user.email "jenkins-bot@example.com"

                        git remote set-url origin https://x-access-token:%GITHUB_TOKEN%@github.com/jagan786786/TaskBoard.git

                        REM Add the new versioned file and version.txt
                        for /f %%F in ('dir /b /o-d task_version') do set LATEST_FILE=%%F & goto :break
                        :break

                        git add task_version\\%LATEST_FILE%
                        git add version.txt
                        git diff --cached --quiet || (
                            git commit -m "chore: add new task version %LATEST_FILE%"
                            git pull --rebase origin %BRANCH%
                            git push origin %BRANCH%
                        )
                    '''
                }
            }
        }

        stage('Push to External Repo') {
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

                        REM Copy latest versioned file to external repo
                        for /f %%F in ('dir /b /o-d task_version') do set LATEST_FILE=%%F & goto :break
                        :break
                        copy task_version\\%LATEST_FILE% external_repo\\task_version\\%LATEST_FILE%

                        REM Commit and push to external repo
                        cd external_repo
                        git add task_version\\%LATEST_FILE%
                        git diff --cached --quiet || (
                            git commit -m "chore: add new task version %LATEST_FILE%"
                            git push origin main
                        )
                        cd ..
                    '''
                }
            }
        }
    }
}
