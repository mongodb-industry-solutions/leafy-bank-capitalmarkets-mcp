#!/usr/bin/env node

async function testComparePrices() {
    console.log('==============================================');
    console.log('Testing: Compare BTC and ETH prices');
    console.log('Question: Compare BTC and ETH prices over the last week');
    console.log('Expected: Should compare prices with proper date range');
    console.log('==============================================\n');

    const question = "Compare BTC and ETH prices over the last week";
    
    try {
        const response = await fetch('http://localhost:3000/api/mcp/react-agent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question })
        });

        const data = await response.json();
        
        console.log('Response received!\n');
        
        // Check tool calls
        console.log('Tool Calls:', data.toolCalls?.length || 0);
        
        console.log('\n--- Final Answer ---');
        console.log(data.finalAnswer);
        
        // Validate the response
        console.log('\n--- Validation ---');
        const hasDateRange = data.finalAnswer?.includes('Based on data from') || 
                           data.finalAnswer?.includes('last week') ||
                           data.finalAnswer?.includes('past week');
        console.log('✓ Date range included:', hasDateRange ? 'YES' : 'NO ❌');
        
        const mentionsBTC = data.finalAnswer?.includes('BTC') || data.finalAnswer?.includes('Bitcoin');
        const mentionsETH = data.finalAnswer?.includes('ETH') || data.finalAnswer?.includes('Ethereum');
        console.log('✓ Mentions both assets:', mentionsBTC && mentionsETH ? 'YES' : 'NO ❌');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the test
testComparePrices();