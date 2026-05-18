import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata = {
  title: 'HabitForge Lite — Personal Productivity Dashboard',
  description:
    'Track habits, manage tasks, and analyze your productivity with HabitForge Lite — a beautiful personal productivity dashboard.',
  keywords: 'habit tracker, productivity, task management, time tracking, analytics',
  openGraph: {
    title: 'HabitForge Lite',
    description: 'Your personal productivity and self-improvement dashboard',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#252525',
              color: '#f0f0f0',
              border: '1px solid #383838',
              borderRadius: '10px',
              fontSize: '13px',
              fontFamily: 'Inter, sans-serif',
            },
            success: {
              iconTheme: { primary: '#febfca', secondary: '#1a1a1a' },
            },
            error: {
              iconTheme: { primary: '#f87171', secondary: '#1a1a1a' },
            },
          }}
        />
      </body>
    </html>
  );
}
