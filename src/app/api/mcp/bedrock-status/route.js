import { NextResponse } from 'next/server';
import { defaultBedrockClient, testBedrockConnection } from '../../../../lib/bedrock-client';

export async function GET(request) {
  try {
    console.log('🔍 Checking BedrockClient status...');
    
    // Get status information
    const status = defaultBedrockClient.getStatus();
    
    // Check if connection test is requested
    const { searchParams } = new URL(request.url);
    const testConnection = searchParams.get('test') === 'true';
    
    // Test connection only if explicitly requested
    let connectionTest = null;
    if (testConnection) {
      try {
        console.log('🔍 Testing Bedrock connection...');
        await testBedrockConnection();
        connectionTest = { success: true, message: 'Connection successful' };
      } catch (error) {
        console.error('❌ Bedrock connection test failed:', error.message);
        connectionTest = { success: false, message: error.message };
      }
    } else {
      connectionTest = { 
        success: null, 
        message: 'Connection test not performed. Add ?test=true to test connection.' 
      };
    }
    
    const response = {
      timestamp: new Date().toISOString(),
      status: status,
      connectionTest: connectionTest,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        awsRegion: process.env.AWS_REGION,
        hasAwsProfile: !!process.env.AWS_PROFILE,
      }
    };
    
    console.log('✅ BedrockClient status check completed');
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('❌ BedrockClient status check failed:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check BedrockClient status',
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 