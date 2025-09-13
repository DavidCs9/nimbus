/**
 * AWS Configuration for Nimbus Console
 *
 * Centralizes all AWS service configurations, particularly for Cognito authentication.
 * This follows the project architecture outlined in overview.md for secure credential management.
 */

export interface CognitoConfig {
  region: string;
  userPoolId: string;
  userPoolWebClientId: string;
  identityPoolId: string;
  domain: string; // Cognito Hosted UI domain
}

export interface EC2Config {
  region: string;
  defaultRegions: string[];
}

export interface AWSConfig {
  cognito: CognitoConfig;
  ec2: EC2Config;
}

export interface CognitoUrls {
  signIn: string;
  signOut: string;
  tokenEndpoint: string;
}

/**
 * AWS Configuration Manager
 *
 * Handles all AWS service configurations using OOP principles.
 * Provides centralized access to AWS settings and URL generation.
 */
export class AWSConfigManager {
  private static instance: AWSConfigManager;
  private config: AWSConfig | null = null;

  private constructor() {}

  /**
   * Singleton pattern to ensure single configuration instance
   */
  public static getInstance(): AWSConfigManager {
    if (!AWSConfigManager.instance) {
      AWSConfigManager.instance = new AWSConfigManager();
    }
    return AWSConfigManager.instance;
  }

  /**
   * Validates that all required environment variables are present
   */
  private validateEnvironmentVariables(): void {
    const requiredVars = [
      "NEXT_PUBLIC_AWS_REGION",
      "NEXT_PUBLIC_COGNITO_USER_POOL_ID",
      "NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID",
      "NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID",
      "NEXT_PUBLIC_COGNITO_DOMAIN",
    ];

    // Debug: Log all environment variables
    console.log("🔍 Environment Variables Debug:", {
      NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
      NEXT_PUBLIC_COGNITO_USER_POOL_ID:
        process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
      NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID:
        process.env.NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID,
      NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID:
        process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
      NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
    });

    const missingVars = requiredVars.filter((varName) => {
      const value = process.env[varName];
      const isMissing = !value || value.trim() === "";
      console.log(
        `🔍 Checking ${varName}: value="${value}", missing=${isMissing}`
      );
      return isMissing;
    });

    console.log("🔍 Missing variables:", missingVars);

    if (missingVars.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missingVars.join(", ")}. ` +
          "Please check your .env.local file and ensure all Cognito configuration variables are set."
      );
    }
  }

  /**
   * Gets the AWS configuration from environment variables
   * Validates all required variables are present before returning config
   */
  public getConfig(): AWSConfig {
    if (!this.config) {
      // Validate environment variables first
      this.validateEnvironmentVariables();

      const defaultRegion = process.env.NEXT_PUBLIC_AWS_REGION!;

      this.config = {
        cognito: {
          region: defaultRegion,
          userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID!,
          userPoolWebClientId:
            process.env.NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID!,
          identityPoolId: process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID!,
          domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN!,
        },
        ec2: {
          region: defaultRegion,
          defaultRegions: [
            "us-east-1",
            "us-west-2",
            "eu-west-1",
            "ap-southeast-1",
            defaultRegion, // Include the configured region
          ].filter((region, index, arr) => arr.indexOf(region) === index), // Remove duplicates
        },
      };
    }

    return this.config;
  }

  /**
   * Gets Cognito configuration specifically
   */
  public getCognitoConfig(): CognitoConfig {
    return this.getConfig().cognito;
  }

  /**
   * Gets EC2 configuration specifically
   */
  public getEC2Config(): EC2Config {
    return this.getConfig().ec2;
  }

  /**
   * Constructs the Cognito Hosted UI URLs for authentication flows
   */
  public getCognitoUrls(): CognitoUrls {
    const config = this.getCognitoConfig();
    const redirectUri =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "http://localhost:3000/auth/callback";

    const baseUrl = `https://${config.domain}.auth.${config.region}.amazoncognito.com`;

    return {
      signIn:
        `${baseUrl}/oauth2/authorize?` +
        new URLSearchParams({
          response_type: "code",
          client_id: config.userPoolWebClientId,
          redirect_uri: redirectUri,
          scope: "openid email",
        }).toString(),

      signOut:
        `${baseUrl}/logout?` +
        new URLSearchParams({
          client_id: config.userPoolWebClientId,
          logout_uri:
            typeof window !== "undefined"
              ? window.location.origin
              : "http://localhost:3000",
        }).toString(),

      tokenEndpoint: `${baseUrl}/oauth2/token`,
    };
  }

  /**
   * Gets default AWS SDK client configuration
   */
  public getDefaultClientConfig() {
    const config = this.getConfig();

    return {
      region: config.cognito.region,
      // No credentials here - they will be provided by the credential provider
    };
  }

  /**
   * Gets EC2 client configuration for a specific region
   */
  public getEC2ClientConfig(region?: string) {
    const config = this.getConfig();

    return {
      region: region || config.ec2.region,
      // Credentials will be provided by the credential provider
    };
  }

  /**
   * Resets the configuration (useful for testing or environment changes)
   */
  public resetConfig(): void {
    this.config = null;
  }
}

export const awsConfigManager = AWSConfigManager.getInstance();
