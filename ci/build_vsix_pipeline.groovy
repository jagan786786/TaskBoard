pipeline {
    agent any

    environment {
        PATH = "C:\\Windows\\System32;C:\\Windows;E:\\Git\\bin;E:\\Git\\cmd;E:\\Git\\usr\\bin"
        GITHUB_TOKEN = credentials('github-token')   // internal repo (TaskBoard)
        PAT = credentials('pat-token')               // external repo (task_board_version)
        BRANCH = 'main'
        EXT_REPO = 'https://github.com/jagan786786/task_board_version.git'
    }

    triggers {
        pollSCM('* * * * *') // optional — can replace with webhook
    }

    stages {

        stage('Checkout Source') {
            steps {
                echo "Checking out source branch ${BRANCH}"
                git branch: "${BRANCH}", url: 'https://github.com/jagan786786/TaskBoard.git', credentialsId: 'github-token'
            }
        }

        stage('Setup Node & Install Dependencies') {
            tools { nodejs 'node20' }
            steps {
                bat '''
                    echo Setting up Node environment...
                    node -v || exit /b 1
                    cd frontend
                    call npm ci
                '''
            }
        }

        stage('Install VSCE CLI') {
            tools { nodejs 'node20' }
            steps {
                bat '''
                    echo Installing VSCE CLI...
                    call npm install -g @vscode/vsce
                    call vsce --version
                '''
            }
        }

        stage('Package VSIX') {
            tools { nodejs 'node20' }
            steps {
                bat '''
                    cd frontend
                    for /f "tokens=*" %%v in ('node -p "require('./package.json').version"') do set VERSION=%%v
                    echo Current Version is %VERSION%

                    echo Packaging VSIX...
                    call vsce package --no-dependencies
                    ren *.vsix genie-vscode-hsbc-%VERSION%.vsix

                    if not exist vsix_package_versions mkdir vsix_package_versions
                    move genie-vscode-hsbc-%VERSION%.vsix vsix_package_versions\\
                    echo "VSIX created as genie-vscode-hsbc-%VERSION%.vsix"
                '''
            }
        }

        stage('Commit VSIX to Main Repo') {
            steps {
                withCredentials([string(credentialsId: 'github-token', variable: 'GITHUB_TOKEN')]) {
                    bat '''
                        git config user.name "jenkins-bot"
                        git config user.email "jenkins-bot@example.com"

                        git remote set-url origin https://x-access-token:%GITHUB_TOKEN%@github.com/jagan786786/TaskBoard.git

                        git add frontend\\vsix_package_versions\\*.vsix
                        git diff --cached --quiet || (
                            git commit -m "chore: add VSIX package to vsix_package_versions"
                            git pull --rebase origin %BRANCH%
                            git push origin %BRANCH%
                        )
                    '''
                }
            }
        }

        stage('Push VSIX to External Repo') {
            steps {
                withCredentials([string(credentialsId: 'pat-token', variable: 'PAT')]) {
                    bat '''
                        git config --global user.name "jenkins-bot"
                        git config --global user.email "jenkins-bot@example.com"

                        if not exist vsix_build_version (
                            git clone https://x-access-token:%PAT%@github.com/jagan786786/task_board_version.git vsix_build_version
                        ) else (
                            cd vsix_build_version
                            git pull origin main
                            cd ..
                        )

                        if not exist vsix_build_version\\vsix_build_files mkdir vsix_build_version\\vsix_build_files

                        for /f %%F in ('dir /b /o-d frontend\\vsix_package_versions\\*.vsix') do set LATEST_FILE=%%F & goto :break
                        :break
                        copy frontend\\vsix_package_versions\\%LATEST_FILE% vsix_build_version\\vsix_build_files\\%LATEST_FILE%

                        cd vsix_build_version
                        git add vsix_build_files\\%LATEST_FILE%
                        git diff --cached --quiet || (
                            git commit -m "chore: add VSIX %LATEST_FILE%"
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
                    cd frontend
                    for /f "tokens=*" %%v in ('node -p "require('./package.json').version"') do set VERSION=%%v

                    for /f "tokens=1,2,3 delims=." %%a in ("%VERSION%") do (
                        set MAJOR=%%a
                        set MINOR=%%b
                        set PATCH=%%c
                    )
                    set /a PATCH+=1
                    set NEW_VERSION=%MAJOR%.%MINOR%.%PATCH%

                    call npm version %NEW_VERSION% --no-git-tag-version
                    git add package.json package-lock.json
                    git commit -m "chore: bump version to %NEW_VERSION%" || echo "No version bump"
                    git push origin %BRANCH%
                '''
            }
        }
    }
}
