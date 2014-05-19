rmd-dashboard
=============

ResMed Dashboard

# Dev setup
## Grunt
If you don't already have it, you will need to install the grunt-cli

    npm install -g grunt-cli

## Install dependencies
To set up the development environment, execute the following commands

    npm install
    grunt bower:install

## Run server in development mode

    grunt run

# Troubleshooting
## When I run `grunt bower:install` I get a Git error
Does it look like this?

    Fatal error: Failed to execute "git ls-remote --tags --heads git://github.com/SteveSanderson/knockout.git", exit code of #128

Your firewall is probably blocking connections to port 22 (SSH). Run the following command to use port 443 (SSL) for GitHub downloads (**Note**: this is a global change)

    git config --global url."https://".insteadOf git://

Read more about it [here](https://coderwall.com/p/sitezg).