# Noodle 🍜

A full-stack Next.js application. Follow the instructions below to get the project up and running on your local machine.

## Getting Started

### 1. Download the Project
First, download the project `.zip` file and extract it to your preferred location on your computer.

### 2. Open the Terminal
Open your terminal and navigate into the extracted project directory:

```bash
cd path/to/noodle
```

### 3. Install Dependencies
Install all the required Node.js packages by running:

```bash
npm install
```

### 4. Set Up Environment Variables
Create a new file named `.env` in the root directory of the project. You will need to add the following specific values to this file (replace the placeholder values with your actual credentials):

```env
# Database Configuration
DATABASE_URL="your_database_connection_string_here"

# Application Secrets
NEXTAUTH_SECRET="your_nextauth_secret_here"
NEXTAUTH_URL="http://localhost:3000"

# Add any other required specific values below:
# API_KEY="your_api_key_here"
```

### 5. Run Database Migrations
Before starting the application, set up your database schema by running the migration command:

```bash
npm run db:migrate
```

### 6. Build the Application
Create an optimized production build of the Next.js project:

```bash
npm run build
```

### 7. Start the Server
Finally, start the production server:

```bash
npm run start
```

The application should now be running. Check your terminal for the local host URL (usually `http://localhost:3000`).
