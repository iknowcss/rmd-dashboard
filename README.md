rmd-dashboard
=============

ResMed Dashboard

# Dev setup

## Install Node
This project requires nodejs v0.10.x (v0.10.28 recommended for no particular reason). To install this version of node, run the following command (**Note**: if you don't have nvm, download and install it from [here](https://github.com/creationix/nvm))

    nvm install 0.10

To switch to this version of node, run this command:

    nvm use 0.10

If you would like to make this version of node your default version, run these two commands:

    nvm unalias default
    nvm alias default 0.10 

## Install Grunt
If you don't already have it, you will need to install the grunt-cli

    npm install -g grunt-cli

## Get the source code
Open up a terminal, change directories to the location that you would like to store the source code, and execute the following command:

    git clone https://github.com/iknowcss/rmd-dashboard.git

## Install dependencies
To set up the development environment, execute the following commands

    npm install
    grunt bower:install

## Create a `config.json` for your environment
*rmd-dashboard* aggregates dashboard information from many different sources. For example, it can pull information about builds from Bamboo. You must put information about how to access these data sources `config/config.json`. **This file does not exist already; you must create your own before continuing**. There is an example file in `config/config.json.example`.

## Run server in development mode

    grunt run

# Troubleshooting
## When I run `grunt bower:install` I get a Git error
Does it look like this?

    Fatal error: Failed to execute "git ls-remote --tags --heads git://github.com/SteveSanderson/knockout.git", exit code of #128

Your firewall is probably blocking connections to port 22 (SSH). Run the following command to use port 443 (SSL) for GitHub downloads (**Note**: this is a global change)

    git config --global url."https://".insteadOf git://

Read more about it [here](https://coderwall.com/p/sitezg).

## When I execute `grunt run` I get an error
Does it look like this?

    The 'protocol' property must be a valid string

Did you create a `config/config.json` for your environment? You need one to tell *rmd-dashboard* where to find the information it aggregates. See [here](#create-a-configjson-for-your-environment).