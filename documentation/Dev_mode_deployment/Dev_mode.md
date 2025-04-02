# Developer mode implementation

## Introduction

This document provides information on how dev mode is implemented within the application

## nodemon.json

This is a config file for use with the node module nodemon, and it allows the use of moniter to detect any changes made within a speicfied folder to restart the electron application
  "watch": ["src"], This specifies where the moniter should be watching any changes made live
  "ext": "js,jsx,html,css", This specifies the file extensions that are included with changed files
  "exec": "electron ." This launches the electron application

## How to start Dev Mode

Located within the package.json file, the NPM scripts are implememented to launch and build the projct, in addtion dev mode is now its own seperate script:
"dev": "concurrently \"webpack --watch\" \"nodemon\""

## Install dependencies

To launch the project with nodemon, install the following dependencies within the project: [npm install nodemon concurrently --save-dev]
This installs the following modules: nodemon and concurrenlty. 
Concrrenlty is used to launch both the electron application and the nodemon package

