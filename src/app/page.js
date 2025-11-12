"use client";

import ChatInterface from "@/components/ChatInterface/ChatInterface";
import LeafygreenProvider from "@leafygreen-ui/leafygreen-provider";

export default function Home() {
  return (
    <LeafygreenProvider darkMode={false}>
      <ChatInterface />
    </LeafygreenProvider>
  );
}