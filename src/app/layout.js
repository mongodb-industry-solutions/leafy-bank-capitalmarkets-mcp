import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata = {
  title: "Investment Portfolio Management - MCP Interaction",
  description: "AI-powered financial insights using MongoDB MCP Server",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden', fontFamily: GeistSans.style.fontFamily }}>
        {children}
      </body>
    </html>
  );
}