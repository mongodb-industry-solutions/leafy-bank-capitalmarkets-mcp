import { NextResponse } from 'next/server';
import { BedrockClient } from '@aws-sdk/client-bedrock';
import fs from 'fs';

// Mark this route as dynamic to prevent static rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('🔍 AWS Debug: Testing credentials...');
    
    // Test environment variables
    const envVars = {
      AWS_REGION: process.env.AWS_REGION,
      AWS_PROFILE: process.env.AWS_PROFILE,
      AWS_SHARED_CREDENTIALS_FILE: process.env.AWS_SHARED_CREDENTIALS_FILE,
      AWS_CONFIG_FILE: process.env.AWS_CONFIG_FILE,
      NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
      NEXT_PUBLIC_AWS_PROFILE: process.env.NEXT_PUBLIC_AWS_PROFILE,
      NEXT_PUBLIC_AWS_SHARED_CREDENTIALS_FILE: process.env.NEXT_PUBLIC_AWS_SHARED_CREDENTIALS_FILE,
      NEXT_PUBLIC_AWS_CONFIG_FILE: process.env.NEXT_PUBLIC_AWS_CONFIG_FILE,
      NEXT_PUBLIC_CHAT_COMPLETIONS_MODEL_ID: process.env.NEXT_PUBLIC_CHAT_COMPLETIONS_MODEL_ID,
      // Add all environment variables for debugging
      ALL_ENV: Object.keys(process.env).filter(key => key.includes('AWS')).reduce((obj, key) => {
        obj[key] = process.env[key];
        return obj;
      }, {})
    };
    
    console.log('📊 Environment variables:', envVars);
    
    // Test if credential files exist
    const credentialFile = process.env.AWS_SHARED_CREDENTIALS_FILE || process.env.NEXT_PUBLIC_AWS_SHARED_CREDENTIALS_FILE || '/root/.aws/credentials';
    const configFile = process.env.AWS_CONFIG_FILE || process.env.NEXT_PUBLIC_AWS_CONFIG_FILE || '/root/.aws/config';
    
    let credentialFileExists = false;
    let configFileExists = false;
    
    try {
      credentialFileExists = fs.existsSync(credentialFile);
      console.log(`📁 Credential file exists: ${credentialFileExists} (${credentialFile})`);
    } catch (error) {
      console.log(`❌ Error checking credential file: ${error.message}`);
    }
    
    try {
      configFileExists = fs.existsSync(configFile);
      console.log(`📁 Config file exists: ${configFileExists} (${configFile})`);
    } catch (error) {
      console.log(`❌ Error checking config file: ${error.message}`);
    }
    
    // Test AWS SDK client creation
    const clientConfig = {
      region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    };
    
    if (process.env.AWS_PROFILE || process.env.NEXT_PUBLIC_AWS_PROFILE) {
      clientConfig.profile = process.env.AWS_PROFILE || process.env.NEXT_PUBLIC_AWS_PROFILE;
    }
    
    console.log('🔐 Client config:', clientConfig);
    
    try {
      const client = new BedrockClient(clientConfig);
      console.log('✅ AWS Bedrock client created successfully');
      
      // Test a simple API call
      const { ListFoundationModelsCommand } = await import('@aws-sdk/client-bedrock');
      const command = new ListFoundationModelsCommand({});
      const response = await client.send(command);
      
      console.log('✅ AWS API call successful');
      
      return NextResponse.json({
        success: true,
        message: 'AWS credentials working!',
        environment: envVars,
        clientConfig: clientConfig,
        credentialFileExists: credentialFileExists,
        configFileExists: configFileExists,
        modelsFound: response.modelSummaries?.length || 0,
        timestamp: new Date().toISOString()
      });
      
    } catch (clientError) {
      console.error('❌ AWS client error:', clientError);
      
      return NextResponse.json({
        success: false,
        message: 'AWS client creation failed',
        error: clientError.message,
        environment: envVars,
        clientConfig: clientConfig,
        credentialFileExists: credentialFileExists,
        configFileExists: configFileExists,
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('❌ AWS Debug error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'AWS Debug failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
} 