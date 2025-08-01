#!/usr/bin/env node

async function testReactAgent() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing React Agent with various assets...\n');
  
  const testQueries = [
    { question: "What are the average trading volumes for SPY on the last 7 days?" },
    { question: "Calculate the average price for BTC over the past 10 days" },
    { question: "Show me ETH volatility for the last 2 weeks" },
    { question: "What's the average volume for QQQ in the past month?" }
  ];
  
  for (const testQuery of testQueries) {
    console.log('\n' + '='.repeat(80));
    console.log('📤 Testing:', testQuery.question);
    console.log('='.repeat(80) + '\n');
    
    try {
      const response = await fetch(`${baseUrl}/api/mcp/react-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testQuery),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('📝 Answer:', data.finalAnswer);
        
        // Check if date range is included
        const hasDateRange = data.finalAnswer?.toLowerCase().includes('based on data from') || 
                           (data.finalAnswer?.includes('from') && data.finalAnswer?.includes('to'));
        console.log('\n✅ Date range included:', hasDateRange);
        
        if (!hasDateRange) {
          console.log('⚠️  WARNING: The answer should include the date range!');
        }
        
        console.log('🔧 Tool calls made:', data.toolCalls?.length || 0);
      } else {
        console.log('❌ Error:', data.error);
      }
      
    } catch (error) {
      console.error('❌ Request failed:', error.message);
    }
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Run the test
testReactAgent();