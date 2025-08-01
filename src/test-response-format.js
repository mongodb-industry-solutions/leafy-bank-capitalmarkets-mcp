#!/usr/bin/env node

async function testResponseFormat() {
    console.log('==============================================');
    console.log('Testing: Response format without tool suggestions');
    console.log('Question: Compare BTC and ETH prices over the last week');
    console.log('Expected: Direct answer without suggesting further actions');
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
        
        console.log('--- Final Answer ---');
        console.log(data.finalAnswer);
        
        // Validate the response
        console.log('\n--- Validation ---');
        
        // Check if it mentions tool names
        const mentionsTools = data.finalAnswer?.toLowerCase().includes('mcp_') || 
                            data.finalAnswer?.toLowerCase().includes('aggregate function') ||
                            data.finalAnswer?.toLowerCase().includes('find function');
        console.log('✓ Does NOT mention tool names:', mentionsTools ? 'NO ❌' : 'YES');
        
        // Check if it suggests further analysis
        const suggestsFurther = data.finalAnswer?.toLowerCase().includes('could use') ||
                              data.finalAnswer?.toLowerCase().includes('we could') ||
                              data.finalAnswer?.toLowerCase().includes('to get more');
        console.log('✓ Does NOT suggest further analysis:', suggestsFurther ? 'NO ❌' : 'YES');
        
        // Check if prices are formatted properly
        const priceMatches = data.finalAnswer?.match(/\$?\d+\.\d+/g);
        let allPricesFormatted = true;
        if (priceMatches) {
            priceMatches.forEach(price => {
                const decimalPart = price.split('.')[1];
                if (decimalPart && decimalPart.length > 2) {
                    allPricesFormatted = false;
                }
            });
        }
        console.log('✓ All prices formatted to 2 decimals:', allPricesFormatted ? 'YES' : 'NO ❌');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the test
testResponseFormat();