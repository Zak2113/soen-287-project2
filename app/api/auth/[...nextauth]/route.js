// app/api/auth/[...nextauth]/route.js
import { handlers } from "@/auth"; // This imports the handlers we exported in Step 1

// This tells Next.js to use the Auth.js logic for both GET and POST requests
export const { GET, POST } = handlers;