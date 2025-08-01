#!/usr/bin/env node

async function testGLDPriceFormat() {
    console.log('==============================================');
    console.log('Testing: GLD price formatting');
    console.log('Question: What is the latest available GLD close price?');
    console.log('Expected: Price formatted to 2 decimal places');
    console.log('==============================================\n');

    const question = "What is the latest available GLD close price?";
    
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
        
        console.log('--- Final Answer ---');
        console.log(data.finalAnswer);
        
        // Validate the response
        console.log('\n--- Validation ---');
        
        // Check for unformatted price
        const hasUnformattedPrice = data.finalAnswer?.match(/\d+\.\d{3,}/);
        console.log('✓ No unformatted prices (3+ decimals):', hasUnformattedPrice ? 'NO ❌ Found: ' + hasUnformattedPrice[0] : 'YES');
        
        // Check for properly formatted price
        const hasFormattedPrice = data.finalAnswer?.match(/\$\d+\.\d{2}/);
        console.log('✓ Has properly formatted price ($XXX.XX):', hasFormattedPrice ? 'YES: ' + hasFormattedPrice[0] : 'NO ❌');
        
        // Check if it mentions GLD
        const mentionsGLD = data.finalAnswer?.includes('GLD');
        console.log('✓ Mentions GLD:', mentionsGLD ? 'YES' : 'NO ❌');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the test
testGLDPriceFormat();