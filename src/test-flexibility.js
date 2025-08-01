#!/usr/bin/env node

async function testFlexibility() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing React Agent flexibility with various assets and time ranges...\n');
  
  const testQueries = [
    // Different assets with same query pattern
    { question: "What is the latest available ETH close price?", expectedAsset: "ETH" },
    { question: "What is the latest available QQQ close price?", expectedAsset: "QQQ" },
    
    // Different time ranges
    { question: "Show me price trends for BTC over the last 2 weeks", expectedDays: 14 },
    { question: "Calculate volatility for GLD over the past month", expectedDays: 30 },
    { question: "What are the average trading volumes for ETH on the last 10 days?", expectedDays: 10 },
    
    // Edge cases
    { question: "Show me XRP trends for the past 90 days", expectedLimit: true },
    { question: "What's the weather like?", expectedRedirect: true },
    { question: "What is the price of AAPL?", expectedUnsupported: true }
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
        body: JSON.stringify({ question: testQuery.question }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log('📝 Answer preview:', data.finalAnswer.substring(0, 200) + '...');
        
        // Check expectations
        if (testQuery.expectedAsset) {
          const mentionsAsset = data.finalAnswer.includes(testQuery.expectedAsset);
          console.log(`✅ Mentions ${testQuery.expectedAsset}:`, mentionsAsset);
        }
        
        if (testQuery.expectedDays && data.toolCalls?.length > 0) {
          const dateFilter = data.toolCalls[0]?.arguments?.pipeline?.find(stage => stage.$match?.timestamp?.$gte)?.$match?.timestamp?.$gte;
          if (dateFilter?.$date) {
            const filterDate = new Date(dateFilter.$date);
            const today = new Date();
            const daysDiff = Math.floor((today - filterDate) / (1000 * 60 * 60 * 24));
            console.log(`✅ Time range used: ${daysDiff} days (expected ~${testQuery.expectedDays})`);
          }
        }
        
        if (testQuery.expectedLimit) {
          const mentions60Days = data.finalAnswer.includes('60 days') || data.finalAnswer.includes('8 weeks') || data.finalAnswer.includes('2 months');
          console.log('✅ Mentions 60-day limit:', mentions60Days);
        }
        
        if (testQuery.expectedRedirect) {
          const isRedirect = data.finalAnswer.includes('financial data analysis') || data.finalAnswer.includes('I can analyze');
          console.log('✅ Redirects to financial queries:', isRedirect);
        }
        
        if (testQuery.expectedUnsupported) {
          const mentionsSupported = data.finalAnswer.includes('supported') || data.finalAnswer.includes('BTC, ETH');
          console.log('✅ Lists supported assets:', mentionsSupported);
        }
        
      } else {
        console.log('❌ Error:', data.error);
      }
      
    } catch (error) {
      console.error('❌ Request failed:', error.message);
    }
    
    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

// Run the test
testFlexibility();