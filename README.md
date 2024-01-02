# Default Starter

Default Starter is a modern app template for new projects and my preferred way to start building web applications. This helps save time in writing boilerplate code and get going with a new project very quickly.

## Table of Contents

- [Technologies](#technologies)
- [Features](#features)
- [Usage](#usage)
- [License](#license)
- [Closing Notes](#closing-notes)

## Technologies

- **TypeScript**: Used both on server and client. Makes it very easy to share types across your app without any code generation.
- **NestJS**: Preferred over other NodeJS frameworks due to the out-of-the-box application architecture that makes building scalable server-side applications easy. 
- **PostgreSQL**: Completely free-to-use license, has wide variety of hosting providers and adherence to SQL standards ensures data integrity and reliability.
- **Drizzle ORM**: Chosen mainly because of its top of the class performence, ease-of-use and great migrations support.  

## Features

- **Scalable folder structure**: Clear separation between application modules, shared utilities(decorators, interceptors, filters), cron jobs and database files(migrations, schema, seeds).
- **Basic Authentication Flow**: Provides a basic authentication flow with sessions, allowing users to register, login and logout. Also added cron job to clear out expired sessions.
- **Password Encryption and Verification**: Includes utilities for securely encrypting passwords and verifying them during authentication.
- **Cookie/Token Creation And Parsing**: Utility functions are available for creating, parsing and managing cookies and tokens for authentication and authorization purposes.
- **Custom Input Validation Setup**: Includes a custom validation pipe that properly formats the errors and returns the correct fields which failed validation.
- **Database Schema**: Includes an example database schema defined with Drizzle ORM, showing how to create database tables, enums and setup relations. Also shows how to infer types from database schema.
- **Automatic Swagger Docs**: Project utilizes NestJS Cli Plugin to generate swagger documentation without any manual work besides adding tags for controllers for better grouping in the final result.
- **Local Development with Docker**: Includes docker to spin up a local postgres container with a volume for easy local development. Automatically sets the database to UTC timezone.

## Usage

1. **Clone the Repository:**
   ```
   git clone https://github.com/your-username/default-starter.git
   
   ```
2. **Install Dependencies:**
   ```
   npm install
   ```
3. **Spin up Local PostgreSQL:**
   ```
   docker-compose up -d
   ```
4. **Push Database Schema**
   ```
   npm run push
   ```
5. **Seed The Database (Optional)**
   ```
   npm run seed
   ```
6. **Generate migrations and run them (When Deploying)**
   ```
   npm run generate && npm run migrate
   ```
## License

This project is licensed under the [MIT License](LICENSE). Feel free to use, modify, and distribute the code as per the terms of the license.

## Closing Notes

I hope that this repository proves to be a valuable resource for your next project. If you have any questions, suggestions, or feedback, please don't hesitate to reach out.

Happy coding!
