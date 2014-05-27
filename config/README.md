# `config.json`

This directory may contain a file called `config.json`. This file defines configuration options specific to your production environment. This file is not intended to be committed to GitHub. Put sensitive information like URLs, user names, and passwords here.

Here is an example `config.json`

    {
      "express": {
        "port": 8080
      },
      "api": {
        "version": "v1"
      },
      "bamboo-rest": {
        "protocol": "http",
        "host": "bamboo.ec2.local"
        "baseUrl": "/rest/api",
        "user": "user",
        "pass": "password"
      }
    }