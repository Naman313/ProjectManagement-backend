# Project Management Application Backend

## Description

This is the backend for the project management application. It is built using Node.js, Express.js, and MongoDB.

## Installation

1. Clone the repository

    ```bash
    git clone git@github.com:AjayBidyarthy/project-management-application-backend.git
    ```

2. Install the dependencies

    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and add the following environment variables

    ```env
    DB_URI="mongodb+srv://blackcoffer:0owTB9f1pUUND3J0@cluster0.mlyy6nq.mongodb.net/project_management"

    PORT=5000

    SERVER_URL="http://localhost:3000"

    EMAIL_USER=your-email
    EMAIL_PASS=your-email-password

    TOKEN_SECRET = "mysecretkey"

    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
    ```

4. Start the server

    ```bash
    npm start
    ```

## API Documentation

The API documentation can be found [here](https://documenter.getpostman.com/view/11636606/Tz5tYv5Q)
