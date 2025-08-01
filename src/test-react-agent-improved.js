#!/usr/bin/env node

async function testReactAgent() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing React Agent with improved tracking...\n');
  
  const testQuery = {
    question: "What are the average trading volumes for SPY on the last 7 days?"
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
        console.log(`  ${i + 1}. ${call.name}:`, JSON.stringify(call.arguments, null, 2));
      });
    }
    
    console.log('\n📊 Tool Results:', data.toolResults?.length || 0);
    
    console.log('\n📈 Tracking Status:');
    console.log('  - Total tool calls:', data.status?.toolCalls?.totalCalls || 0);
    console.log('  - Recent calls:', data.status?.toolCalls?.recentCalls?.length || 0);
    console.log('  - Console logs:', data.status?.consoleLogs?.totalLogs || 0);
    
    // Check if date range is included in the answer
    const hasDateRange = data.finalAnswer?.includes('from') && data.finalAnswer?.includes('to');
    console.log('\n✅ Date range included in answer:', hasDateRange);
    
    if (!hasDateRange) {
      console.log('⚠️  WARNING: The answer should include the date range for the aggregation!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testReactAgent();