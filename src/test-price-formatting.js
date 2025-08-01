#!/usr/bin/env node

async function testPriceFormatting() {
    console.log('==============================================');
    console.log('Testing: Price formatting with 2 decimal places');
    console.log('Question: What is the latest available GLD close price?');
    console.log('Expected: Price should be formatted to 2 decimal places');
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
        
        // Check if price is mentioned
        const priceMatch = data.finalAnswer?.match(/\$?(\d+\.?\d*)/);
        if (priceMatch) {
            const priceStr = priceMatch[1];
            const decimalPart = priceStr.split('.')[1];
            console.log('✓ Found price:', priceStr);
            console.log('✓ Decimal places:', decimalPart ? decimalPart.length : 0);
            console.log('✓ Properly formatted (2 decimals):', 
                decimalPart && decimalPart.length === 2 ? 'YES' : 'NO ❌');
        } else {
            console.log('✗ No price found in response');
        }
        
        // Check for excessive decimal places
        const hasExcessiveDecimals = data.finalAnswer?.match(/\d+\.\d{3,}/);
        console.log('✓ No excessive decimals:', hasExcessiveDecimals ? 'NO ❌' : 'YES');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the test
testPriceFormatting();