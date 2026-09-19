import './globals.css';
import Sidebar from './Sidebar';
import AssistantPanel from '../components/AssistantPanel';

export const metadata = {
  title: 'PulseGuard — Autonomous SaaS Retention & Churn Prevention',
  description: 'Closed-loop multi-tenant customer health and autonomous churn remediation governed by Fastn runtime.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="shell">
          <Sidebar />
          <div className="main-col">{children}</div>
        </div>
        <AssistantPanel />
      </body>
    </html>
  );
}
