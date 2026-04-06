# Noodle 🍜

A full-stack Next.js application. Follow the instructions below to get the project up and running on your local machine.

## Getting Started

### 1. Download the Project
First, download the project `.zip` file and extract it to your preferred location on your computer.

### 2. Open the Terminal
Open your terminal and navigate into the extracted project directory:

```bash
cd soen-287-project2/
```

### 3. Install Dependencies
Install all the required Node.js packages by running:

```bash
npm install
```

### 4. Set Up Environment Variables
Create a new file named `.env` in the root directory of the project. You will need to add the following specific values to this file (replace the placeholder values with your actual credentials):

```env

AUTH_SECRET="SECRET"
SMTP_PASSWORD='"!19-8.RuCC^'
AUTH_TRUST_HOST=true
NEXT_PUBLIC_BASE_URL=http://localhost:3000
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


### PART 2 FEATURE LIST

For the Students

Grades Dashboard: A page that automatically calculates their current GPA and shows how much of each class they have completed.

Smart Calendar: A visual calendar that groups their assignments by date. It uses simple colors to show what is done, what is coming up, and what is overdue.

Class History: A directory that separates the classes they are currently taking from the ones they have already finished.

For the Teachers & Admins

Warning System (Analytics): A dashboard that tracks the whole class. If an assignment is due soon and most students haven't done it, the system highlights it so the teacher knows to step in or offer an extension.

Course Manager: A clean page to add new assignments and see exactly how many students are enrolled in a specific class.

Secure Profile: An account page where they can safely update their name, email, and change their password.

Under the Hood (The Tech Setup)

Validation : Form fields are validated

Solid Security: We set up strict rules for sign-ups (like password length) and made sure passwords are scrambled and hidden in the database.

Auto-Cleaning Database: We linked the database tables together. If you delete a midterm, the database automatically deletes all the grades attached to that midterm so you don't have leftover data cluttering the system.

Dark Mode Ready