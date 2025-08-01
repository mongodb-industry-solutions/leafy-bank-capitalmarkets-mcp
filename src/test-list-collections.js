#!/usr/bin/env node

async function testListCollections() {
    console.log('==============================================');
    console.log('Testing: List collections in the database');
    console.log('Expected: Should list all collections and explain which ones support find/aggregate');
    console.log('==============================================\n');

    const question = "List collections in the database";
    
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
        if (data.toolCalls?.length > 0) {
            console.log('Tool used:', data.toolCalls[0].name);
        }
        
        console.log('\n--- Final Answer ---');
        console.log(data.finalAnswer);
        
        // Validate the response
        console.log('\n--- Validation ---');
        const mentionsBinance = data.finalAnswer?.includes('binanceCryptoData');
        const mentionsYfinance = data.finalAnswer?.includes('yfinanceMarketData');
        console.log('✓ Mentions binanceCryptoData:', mentionsBinance ? 'YES' : 'NO ❌');
        console.log('✓ Mentions yfinanceMarketData:', mentionsYfinance ? 'YES' : 'NO ❌');
        
        const explainsRestriction = data.finalAnswer?.toLowerCase().includes('find') && 
                                   data.finalAnswer?.toLowerCase().includes('aggregate') &&
                                   data.finalAnswer?.toLowerCase().includes('only');
        console.log('✓ Explains find/aggregate restriction:', explainsRestriction ? 'YES' : 'NO ❌');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the test
testListCollections();