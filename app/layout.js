// app/layout.js
import { Inter } from 'next/font/google';
import './globals.css';
import SessionWrapper from "./components/SessionWrapper";

// 1. Initialize the font and grab the standard latin characters
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Noodle LMS',
  description: 'Learning Management System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* 2. Inject the font's CSS class directly into the body tag */}
      <body className={inter.className}>
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}