# DataVisualizations

[AMMA] Data visualizations

## Environment setup

To run this scaffold you will need:

1.  **node.js with npm**

    You can go to [http://nodejs.org/](http://nodejs.org/) and find installation instructions there.

2.  **Ruby**
    
    If you're on linux or mac this is easy enough, just install rvm and use it to install ruby
    [https://rvm.io/](https://rvm.io/)

    If you're on windows:
    [http://rubyinstaller.org/downloads/](http://rubyinstaller.org/downloads/)

    I chose version [2.1.5 (x64)](http://dl.bintray.com/oneclick/rubyinstaller/rubyinstaller-2.1.5-x64.exe?direct)

3.  **Compass**

    This is the whole reason for installing ruby.
    Compass is a css preprocessor and will be used for our SASS needs.

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

    Also install the angular-generator and the karma generator

    `npm install -g generator-angular`
    `npm install -g generator-karma`


# Extra information

This project is generated with [yo angular generator](https://github.com/yeoman/generator-angular)
version 0.11.1.

## Build & development

Run `grunt` for building and `grunt serve` for preview.

## Testing

Running `grunt test` will run the unit tests with karma.
