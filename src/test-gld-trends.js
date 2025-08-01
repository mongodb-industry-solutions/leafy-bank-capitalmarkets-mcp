#!/usr/bin/env node

async function testGLDTrends() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing GLD price trends query...\n');
  
  const testQuery = {
    question: "Show me price trends for GLD"
  };
  
  try {
    console.log('📤 Sending request:', testQuery);
    
    const response = await fetch(`${baseUrl}/api/mcp/react-agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testQuery),
    });
    
    const data = await response.json();
    
    console.log('\n📥 Response received:');
    console.log('✅ Success:', data.success);
    console.log('\n📝 Final Answer:');
    console.log(data.finalAnswer);
    
    console.log('\n🔧 Tool Calls:', data.toolCalls?.length || 0);
    if (data.toolCalls?.length > 0) {
      data.toolCalls.forEach((call, i) => {
        const dateFilter = call.arguments?.pipeline?.find(stage => stage.$match?.timestamp?.$gte)?.$match?.timestamp?.$gte;
        console.log(`  ${i + 1}. ${call.name}:`);
        console.log(`     Symbol: ${call.arguments?.pipeline?.[0]?.$match?.symbol || 'unknown'}`);
        console.log(`     Date filter: ${dateFilter ? JSON.stringify(dateFilter) : 'No date filter'}`);
        if (dateFilter?.$date) {
          const filterDate = new Date(dateFilter.$date);
          const today = new Date();
          const daysDiff = Math.floor((today - filterDate) / (1000 * 60 * 60 * 24));
          console.log(`     Days back: ${daysDiff} days`);
        }
      });
    }
    
    // Check date range
    const dateRangeIncluded = data.finalAnswer?.toLowerCase().includes('from') || data.finalAnswer?.includes('based on data');
    console.log('\n✅ Date range included in answer:', dateRangeIncluded);
    
    // Check if it's using recent data (not 3 months ago)
    const mentionsMay = data.finalAnswer?.includes('May') || data.finalAnswer?.includes('2025-05');
    const mentionsJuly = data.finalAnswer?.includes('July') || data.finalAnswer?.includes('2025-07');
    const mentionsAugust = data.finalAnswer?.includes('August') || data.finalAnswer?.includes('2025-08');
    
    if (mentionsMay) {
      console.log('⚠️  WARNING: Answer mentions May data (3 months ago) - should use last 7 days!');
    } else if (mentionsJuly || mentionsAugust) {
      console.log('✅ Answer uses recent data (July/August)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testGLDTrends();