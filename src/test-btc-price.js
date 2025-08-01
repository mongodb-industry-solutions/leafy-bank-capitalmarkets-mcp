#!/usr/bin/env node

async function testBTCPrice() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🧪 Testing BTC price query with clean context...\n');
  
  const testQuery = {
    question: "What is the latest available BTC close price?"
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
        console.log(`  ${i + 1}. ${call.name} for`, call.arguments?.filter?.symbol || call.arguments?.pipeline?.[0]?.$match?.symbol || 'unknown');
      });
    }
    
    // Check if answer mentions only BTC
    const mentionsSPY = data.finalAnswer?.includes('SPY');
    const mentionsETH = data.finalAnswer?.includes('ETH');
    const mentionsQQQ = data.finalAnswer?.includes('QQQ');
    const mentionsBTC = data.finalAnswer?.includes('BTC') || data.finalAnswer?.includes('Bitcoin');
    
    console.log('\n✅ Answer mentions BTC:', mentionsBTC);
    if (mentionsSPY || mentionsETH || mentionsQQQ) {
      console.log('⚠️  WARNING: Answer incorrectly mentions other assets:');
      if (mentionsSPY) console.log('   - SPY (should not be mentioned)');
      if (mentionsETH) console.log('   - ETH (should not be mentioned)');
      if (mentionsQQQ) console.log('   - QQQ (should not be mentioned)');
    } else {
      console.log('✅ Answer correctly focuses only on BTC');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run the test
testBTCPrice();