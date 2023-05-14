# Default Starter

## Description

This is a repository that provides a complete guide and all the necessary files to set up a new full-stack project. This is perfect for developers who want to get started with building web applications quickly, without having to worry about setting up the basic structure every time. Default Starter includes all the necessary components to get you up and running, including a robust file structure, pre-configured tools, and a suite of best practices for building web applications. It's highly customizable and can be easily adapted to meet your specific needs.

## Setup Guide

### Requirements

-   Node.js version 14.18+, 16+
-   PostgreSQL version 12+

### Server

1. Run command "npm init -y" to generate package.json
2. Set "main": "server.js", Add "Type": "module"
3. Create a "src" folder and create a file server.js
4. Run command "npm install -D nodemon"
5. Add "dev": "nodemon src/server.js" under "scripts" in package.json
6. Run command "npm install cors dotenv express express-async-errors pg"
7. Setup .gitignore and .env files
8. Add folders 'Controllers', 'db', 'middleware', 'routes'
9. Connect to the database and setup basic routes to check connection
10. Add necessary imports, middleware to server.js and spin up the server

### Client

1. Run command "npm create vite@latest"
2. Add project name or . to create project in the working directory
3. Select React as the framework
4. Select Javascript + SWC as the variant
5. Run command "npm install axios react-icons react-router-dom styled-components@5.3.10"
6. Delete all unnecessary files
7. Add \_redirects file to "public" folder to fix routing
8. Add Clean HTML Boilerplate & CSS Global Styles to index.css
9. Setup .gitignore and .env files
10. Spin up vite development server
