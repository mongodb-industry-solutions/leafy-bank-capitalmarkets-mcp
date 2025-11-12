import { ChatBedrockConverse } from "@langchain/aws";
import { BedrockClient as AwsBedrockClient } from "@aws-sdk/client-bedrock";
import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

/**
 * BedrockClientManager class for managing AWS Bedrock connections
 * Mirrors the Python implementation for consistency
 */
export class BedrockClientManager {
  /**
   * Initialize BedrockClient class.
   * 
   * @param {string} regionName - AWS region name. Default is process.env.AWS_REGION.
   * @param {string} awsAccessKey - AWS access key. Default is process.env.AWS_ACCESS_KEY_ID.
   * @param {string} awsSecretKey - AWS secret key. Default is process.env.AWS_SECRET_ACCESS_KEY.
   * @param {string} assumedRole - AWS assumed role. Default is null.
   */
  constructor(
    regionName = process.env.NEXT_PUBLIC_AWS_REGION,
    awsAccessKey = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
    awsSecretKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
    assumedRole = null
  ) {
    this.regionName = regionName;
    this.assumedRole = assumedRole;
    this.awsAccessKey = awsAccessKey;
    this.awsSecretKey = awsSecretKey;
    this.bedrockClient = null;
  }

  /**
   * Get the target region for AWS operations
   * @returns {string} The target region
   */
  _getTargetRegion() {
    if (this.regionName) {
      return this.regionName;
    }
    return process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
  }

  /**
   * Get the default model ID from environment variables
   * @returns {string} The default model ID
   */
  _getDefaultModelId() {
    return process.env.NEXT_PUBLIC_CHAT_COMPLETIONS_MODEL_ID || process.env.CHAT_COMPLETIONS_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';
  }

  /**
   * Create a ChatBedrockConverse client with proper configuration
   * 
   * @param {Object} options - Configuration options
   * @param {string} options.model - The model to use (default: from CHAT_COMPLETIONS_MODEL_ID env var)
   * @param {number} options.maxTokens - Maximum tokens for responses (default: 4000)
   * @param {number} options.temperature - Temperature for responses (default: 0.1)
   * @returns {ChatBedrockConverse} Configured ChatBedrockConverse client
   */
    getBedrockClient(options = {}) {
    const {
      model = this._getDefaultModelId(),
      maxTokens = 4000,
      temperature = 0.1
    } = options;

    const targetRegion = this._getTargetRegion();
    const profileName = process.env.AWS_PROFILE || process.env.NEXT_PUBLIC_AWS_PROFILE;

    console.log(`🔐 Creating Bedrock client with region: ${targetRegion}`);
    
    // Build session configuration (mirroring Python boto3.Session approach)
    const sessionConfig = {
      region: targetRegion,
    };

    // Add profile if specified (for SSO authentication)
    if (profileName) {
      console.log(`🔐 Using AWS profile: ${profileName}`);
      sessionConfig.profile = profileName;
    }

    // Add explicit credentials if provided
    if (this.awsAccessKey && this.awsSecretKey) {
      console.log(`🔐 Using explicit access key and secret key`);
      sessionConfig.credentials = {
        accessKeyId: this.awsAccessKey,
        secretAccessKey: this.awsSecretKey,
      };
    }

    // Add credential file paths if available
    if (process.env.NEXT_PUBLIC_AWS_SHARED_CREDENTIALS_FILE) {
      console.log(`🔐 Using credentials file: ${process.env.NEXT_PUBLIC_AWS_SHARED_CREDENTIALS_FILE}`);
    }
    if (process.env.NEXT_PUBLIC_AWS_CONFIG_FILE) {
      console.log(`🔐 Using config file: ${process.env.NEXT_PUBLIC_AWS_CONFIG_FILE}`);
    }

    // Create Bedrock client (non-runtime for management operations)
    try {
      const bedrockClient = new AwsBedrockClient(sessionConfig);
      console.log(`✅ AWS Bedrock client successfully created!`);
      
      // Store the native client for testing
      this.awsClient = bedrockClient;
    } catch (error) {
      console.error('Failed to create AWS Bedrock client:', error);
      throw new Error(`AWS Bedrock client creation failed: ${error.message}`);
    }

    // Create Bedrock Runtime client (for inference operations)
    try {
      const bedrockRuntimeClient = new BedrockRuntimeClient(sessionConfig);
      console.log(`✅ AWS Bedrock Runtime client successfully created!`);
      
      // Store the runtime client
      this.bedrockRuntimeClient = bedrockRuntimeClient;
    } catch (error) {
      console.error('Failed to create AWS Bedrock Runtime client:', error);
      throw new Error(`AWS Bedrock Runtime client creation failed: ${error.message}`);
    }

    // Build LangChain client configuration (mirroring the same session approach)
    const clientConfig = {
      model: model,
      region: targetRegion,
      maxTokens: maxTokens,
      temperature: temperature,
    };

    // Add profile for SSO authentication
    if (profileName) {
      clientConfig.profile = profileName;
    }

    // Add explicit credentials if provided
    if (this.awsAccessKey && this.awsSecretKey) {
      clientConfig.credentials = {
        accessKeyId: this.awsAccessKey,
        secretAccessKey: this.awsSecretKey,
      };
    }

    try {
      this.bedrockClient = new ChatBedrockConverse(clientConfig);
      console.log(`✅ LangChain Bedrock client successfully created!`);
      return this.bedrockClient;
    } catch (error) {
      console.error('Failed to create LangChain Bedrock client:', error);
      throw new Error(`LangChain Bedrock client creation failed: ${error.message}`);
    }
  }

  /**
   * Test Bedrock connectivity and model access
   * 
   * @param {string} model - Model to test (default: from CHAT_COMPLETIONS_MODEL_ID env var)
   * @returns {Promise<boolean>} True if connection is successful
   */
  async testConnection(model = this._getDefaultModelId()) {
    try {
      // First test the native AWS client
      if (!this.awsClient) {
        this.getBedrockClient({ model });
      }

      // Test with a simple AWS SDK call first (mirroring Python approach)
      const { ListFoundationModelsCommand } = await import("@aws-sdk/client-bedrock");
      const command = new ListFoundationModelsCommand({});
      const response = await this.awsClient.send(command);
      
      console.log(`✅ AWS Bedrock connection test successful - Found ${response.modelSummaries?.length || 0} models`);
      
      // Test the runtime client with a simple invoke
      if (this.bedrockRuntimeClient) {
        const { InvokeModelCommand } = await import("@aws-sdk/client-bedrock-runtime");
        
        // Create a simple test payload for Claude
        const testPayload = {
          anthropic_version: "bedrock-2023-05-31",
          max_tokens: 100,
          messages: [
            {
              role: "user",
              content: "Hello, this is a connection test."
            }
          ]
        };

        const invokeCommand = new InvokeModelCommand({
          modelId: model,
          contentType: "application/json",
          body: JSON.stringify(testPayload)
        });

        const invokeResponse = await this.bedrockRuntimeClient.send(invokeCommand);
        console.log('✅ AWS Bedrock Runtime connection test successful');
      }
      
      // Now test the LangChain client
      const client = this.getBedrockClient({ model });
      
      // Test with a simple message
      const testMessage = "Hello, this is a connection test.";
      const langchainResponse = await client.invoke([{ role: "user", content: testMessage }]);
      
      console.log('✅ LangChain Bedrock connection test successful');
      return true;
    } catch (error) {
      console.error('❌ Bedrock connection test failed:', error.message);
      
      // Provide helpful error messages
      if (error.message.includes('credentials') || error.message.includes('provider')) {
        throw new Error('AWS authentication failed. Please ensure you are logged in with "aws sso login --profile default" and your AWS credentials are properly configured.');
      } else if (error.message.includes('Bedrock') || error.message.includes('bedrock')) {
        throw new Error('Unable to access AWS Bedrock. Please verify your AWS account has Bedrock access and the model is available in your region.');
      } else if (error.message.includes('model')) {
        throw new Error(`Model ${model} is not available. Please check if the model exists in your region.`);
      }
      
      throw error;
    }
  }

  /**
   * Close Bedrock client connection
   */
  closeBedrock() {
    if (this.bedrockClient) {
      // Note: ChatBedrockConverse doesn't have a close method, but we can clean up references
      this.bedrockClient = null;
      console.log('🔒 Bedrock client connection closed');
    }
  }

  /**
   * Get client status information
   * @returns {Object} Status information
   */
  getStatus() {
    return {
      region: this._getTargetRegion(),
      modelId: this._getDefaultModelId(),
      hasCredentials: !!(this.awsAccessKey && this.awsSecretKey),
      hasProfile: !!(process.env.AWS_PROFILE || process.env.NEXT_PUBLIC_AWS_PROFILE),
      hasAssumedRole: !!this.assumedRole,
      clientActive: !!this.bedrockClient,
      awsClientActive: !!this.awsClient,
      bedrockRuntimeClientActive: !!this.bedrockRuntimeClient,
      environment: {
        awsRegion: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION,
        awsProfile: process.env.AWS_PROFILE || process.env.NEXT_PUBLIC_AWS_PROFILE,
        awsSharedCredentialsFile: process.env.AWS_SHARED_CREDENTIALS_FILE || process.env.NEXT_PUBLIC_AWS_SHARED_CREDENTIALS_FILE,
        awsConfigFile: process.env.AWS_CONFIG_FILE || process.env.NEXT_PUBLIC_AWS_CONFIG_FILE,
        chatCompletionsModelId: process.env.NEXT_PUBLIC_CHAT_COMPLETIONS_MODEL_ID,
        hasAccessKey: !!(process.env.AWS_ACCESS_KEY_ID || process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID),
        hasSecretKey: !!(process.env.AWS_SECRET_ACCESS_KEY || process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY),
      }
    };
  }

  /**
   * Destructor - clean up resources
   */
  destroy() {
    this.closeBedrock();
  }
}

// Export a default instance for convenience
export const defaultBedrockClient = new BedrockClientManager();

// Export utility functions
export const createBedrockClient = (region, accessKey, secretKey, assumedRole) => {
  return new BedrockClientManager(region, accessKey, secretKey, assumedRole);
};

export const testBedrockConnection = async (client = defaultBedrockClient) => {
  return await client.testConnection();
}; 