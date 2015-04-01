# [AMMA] Data visualizations

## Environment setup

To run this scaffold you will need:

1.  **node.js with npm**

    ##### Windows

    You can go to [http://nodejs.org/](http://nodejs.org/) and find installation instructions there.

    ##### Linux

    First install the prerequisites:
    
    `sudo apt-get update`
    
    `sudo apt-get install build-essential libssl-dev`
    
    Now follow the installation instructions for [nvm](https://github.com/creationix/nvm).
    
    `curl https://raw.githubusercontent.com/creationix/nvm/v0.23.3/install.sh | bash`
    
    or if you want to use Wget:
    
    `wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.23.3/install.sh | bash`
    
    Install the latest version of node using nvm (in a new terminal to make sure it's sourced)
    
    `nvm install stable`
    
    `nvm alias default stable`
    
    `nvm use default`

    Now install npm and you should be done with this part.

    `sudo apt-get install npm`


2.  **Ruby**
    
    If you're on linux or mac this is easy enough, just install rvm and use it to install ruby
    [https://rvm.io/](https://rvm.io/)

    If you're on windows:
    [http://rubyinstaller.org/downloads/](http://rubyinstaller.org/downloads/)

    I chose version [2.1.5 (x64)](http://dl.bintray.com/oneclick/rubyinstaller/rubyinstaller-2.1.5-x64.exe?direct)

3.  **Compass**

    This is the whole reason for installing ruby.
    Compass is a css preprocessor and will be used for our SASS needs.
    If you want to read up on the benefits of SASS, look at [this](http://www.webinsation.com/benefits-of-using-sass-over-traditional-css/) page.

    Installation instructions can be found on [http://compass-style.org/install/](http://compass-style.org/install/)

    `gem update --system`

    `gem install compass`

    compass should be installed now.

    Now we add the middleware for the interaction between node and compass

    `npm install node-compass`

    ##### Troubleshooting ruby gem installation

    If you're on windows and this is giving you troubles with certificates (like it did on my pc), do the following:
    (taken from [here](http://stackoverflow.com/questions/5720484/how-to-solve-certificate-verify-failed-on-windows))

    1.  download this file [http://curl.haxx.se/ca/cacert.pem](http://curl.haxx.se/ca/cacert.pem)
    2.  Go to your Computer -> Advanced Settings -> Environment Variables
    3.  Create a new System Variable:

        Variable: SSL_CERT_FILE
        Value: C:\location\where\you\saved\cacert.pem

    Now close your shell and reopen it to load the new environment variable you just created and execute the gem commands stated previously.

4.  **Yeoman, Grunt, Bower**
    
    The scaffolding framework we've chosen is Yeoman
    More info can be found on [http://yeoman.io/](http://yeoman.io/)

    `npm install -g yo`
    or
    `sudo npm install -g yo`

    On linux you have to install grunt and bower seperately:
    
    `sudo npm install -g grunt-cli`

    `sudo npm install -g bower`

    Also install the angular-generator and the karma generator

    `npm install -g generator-angular`
    
    `npm install -g generator-karma`

5. **Angular bootstrap**
    Run bower install angular-ui-bootstrap

6. **For Windows: Visual Studio**

    For compiling a project, Grunt uses the build tools from MS Visual studio. You can download the free version [here](http://www.visualstudio.com/).

# Extra information

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.11.1.

## Build & development

After cloning the git, bring the command line to the project directory. 
Now, resolve the project dependencies by executing `npm install`.

Resolve the bower dependencies by executing `bower install`

If you are using MS Visual Studio 2013, you should instead execute: 

`npm install --msvs_version=2013`

(If you encounter the ECONNRESET error, you resolve this by instructing npm to use http instead of https by executing:
`npm config set registry http://registry.npmjs.org/` and retrying the install command from above.)

Run `grunt` for building.
When this succeeds, you can execute `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.
