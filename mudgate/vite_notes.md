REMEMBER, YOU HAVE TO INITIALIZE ANY NEW REACT PROJECT BY DOING THIS:

# NOW WE ARE SUPPOSED TO CREATE THE REACT APP USING vite
mkdir app1-new
cd app1-new
npm create vite@latest 

then choose
- React
- Javascript (*see notes below)

Valid variant options:
JavaScript          Vanilla JS with React	                ✅ You’re using .js files (default)
TypeScript          Adds static typing and .tsx/.ts files   You want type safety
JavaScript + SWC	JS compiled with SWC (faster builds)    You want performance, experimental
TypeScript + SWC	Same, but with TypeScript               You want both TypeScript + SWC


#   Also, I installed nvm (node version manager) with this powershell command
    winget install --id CoreyButler.NVMforWindows -e

#   here is the terminal output (e.g. what happened next) NOTE: wasn't working in the vs code terminals, so ran in a new windows terminal
    PS C:\Users\emg> nvm --version
    1.2.2
    PS C:\Users\emg> node -v
    v20.14.0
    PS C:\Users\emg> nvm install 22
    Downloading node.js version 22.17.1 (64-bit)...
    Extracting node and npm...
    Complete
    Installation complete.
    If you want to use this version, type:
    PS C:\Users\emg> nvm use 22
    Now using node v22.17.1 (64-bit)
    PS C:\Users\emg> node -v
    v22.17.1
    PS C:\Users\emg>
# and you need to install this dependency for DO
    npm install -D vite
    apparently you only need the dev dependency, because vite use dev for building, and release serves the files in production 
# and these are regular installs
    npm install zustand
    npm install react react-dom
    npm install react react-scripts


#   the package lock might get out of sync during creation. this will always solve that. 
#   ALWAYS DO BEFORE COMMIT
    Remove-Item -Force package-lock.json
    Remove-Item -Recurse -Force node_modules
    npm install

# APPARENTLY THE BELOW IS DEPRECATED (but still works)
    cd C:\projects\app1
    npm init -y
    npm install
    npm install zustand
    npm install react react-dom
    npm install react react-scripts

    OR these are the basic instructions before you've even written any code

    # 1) scaffold
    npx create-react-app . --template cra-template-pwa   # "." means "here"
    # 2) add zustand (lightweight store)
    npm install zustand
    # 3) remove the boilerplate App.* files and drop in the ones we wrote
    rm src/App.js src/App.css
    cp ../your-edited-files/App.js src/
    # (or paste the content in VS Code)

    # 4) test locally
    npm start          # http://localhost:3000

    # 5) commit
    git add package.json package-lock.json src/ public/
    git commit -m "initial CRA scaffold"


