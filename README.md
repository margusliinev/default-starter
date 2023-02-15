# Default Starter

## Description

This is a repository that provides a complete guide and all the necessary files to set up a new project with Vite, React, and TailwindCSS which is my preferred way of building web apps.

## Setup Guide

### Requirements

1. Node.js version 14.18+, 16+

### Install Vite & React

1. Run command "npm create vite@latest"
2. Add project name or . to create project in the working directory
3. Select React as the framework
4. Select Javascript + SWC as the variant
5. Run command "npm install" to install all the necessary node modules

### Install Tailwind CSS

1. Run command "npm install -D tailwindcss postcss autoprefixer"
2. Run command "npx tailwindcss init -p"
3. Configure Template Paths by adding: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'] to tailwind.config.cjs
4. Add tailwind directives to index.css file. @tailwind base, @tailwind components, @tailwind utilities

### Delete All Unnecessary Files

1. Replace index.html file with the one found in this repository
1. Delete Public & Assets folder
1. Delete app.css file
