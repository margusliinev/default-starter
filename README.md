# Default Starter

## Description

This is a repository that provides a complete guide and all the necessary files to set up a new full-stack project. This is perfect for developers who want to get started with building web applications quickly, without having to worry about setting up the basic structure every time.

Default Starter includes all the necessary components to get you up and running, including a robust file structure, pre-configured tools, and a suite of best practices for building web applications. It's highly customizable and can be easily adapted to meet your specific needs.

## Setup Guide

### Requirements

-   Node.js version 14.18+, 16+
-   PostgreSQL version 12+

### Technologies

-   Typescript (Front-End & Back-End)
-   Node.js + Express
-   PostgreSQL
-   React + Redux
-   Styled-Components

### Client

1. Run command "npm create vite@latest" and set project name (.), framework (React) and variant (Typescript + SWC)
2. Run command "npm install react-icons react-is react-router-dom react-redux @reduxjs/toolkit styled-components@5.3.10"
3. Run command "npm install -D @types/styled-components eslint-plugin-react@latest eslint-plugin-simple-import-sort"
4. Delete all the unnecessary files and uninstall unused dependencies
5. Add Clean HTML Boilerplate & create "styles" folder for index.css(Global Styles) and styled_components
6. Create .gitignore and .env files, remove "include": ["src"] from tsconfig.json, add \_redirects file to "public" folder
7. Create Redux Toolkit files "store.ts", "hooks.ts", "features" folder with slices and add imports to "main.tsx"
8. Create scripts for development, linting, building, and deployment in package.json
9. Set up ESLint by running command "npm init @eslint/config" to generate .eslintrc.json file
10. Set up data fetching with RTK Query and run command "npm run dev" to test client

### Server

1. Run command "npm init -y" to generate package.json and set "main": "server.ts"
2. Run command "npm install express express-async-errors dotenv cors pg"
3. Run command "npm install -D typescript ts-node nodemon concurrently @types/node @types/express @types/pg @types/cors eslint-plugin-simple-import-sort"
4. Run command "npx tsc --init" to generate tsconfig.json and set "rootDir" & "outDir" paths
5. Create "src" folder with basic structure (controllers, routes, db, server.ts)
6. Create "errors" and "middleware" folders and set up error handling
7. Create .gitignore and .env files
8. Create scripts for development, linting, building, and deployment in package.json
9. Set up ESLint by running command "npm init @eslint/config" to generate .eslintrc.json file
10. Set up server.ts and run command "npm run dev" to test the server
