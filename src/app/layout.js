import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata = {
  title: "MongoDB MCP Server Demo",
  description: "Financial Data Analysis Chat Demo using MongoDB MCP Server",
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