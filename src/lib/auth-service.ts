/**
 * Cognito Authentication Service
 *
 * Implements the core authentication logic for the Nimbus Console.
 * Handles Hosted UI integration, token management, and STS credential exchange.
 */

import {
  CognitoIdentityProviderClient,
  GetUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {
  CognitoIdentityClient,
  GetIdCommand,
  GetCredentialsForIdentityCommand,
} from "@aws-sdk/client-cognito-identity";
import { fromCognitoIdentity } from "@aws-sdk/credential-providers";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { awsConfigManager, type AWSConfigManager } from "@/lib/aws-config";
import type { User, AuthTokens } from "@/lib/auth-context";

/**
 * Parsed JWT token payload
 */
interface JWTPayload {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  exp: number;
  iat: number;
  token_use: string;
  [key: string]: unknown;
}

/**
 * Token exchange response from Cognito
 */
interface TokenResponse {
  access_token: string;
  id_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * AWS Credentials from STS
 */
interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
  expiration?: Date;
}

/**
 * Cognito Authentication Service
 *
 * Manages all aspects of Cognito authentication using OOP principles.
 * Provides secure token handling and AWS credential management.
 */
class CognitoAuthService {
  private static instance: CognitoAuthService;
  private configManager: AWSConfigManager;
  private cognitoClient: CognitoIdentityProviderClient | null = null;
  private identityClient: CognitoIdentityClient | null = null;
  private stsClient: STSClient | null = null;

  private constructor() {
    this.configManager = awsConfigManager;
  }

  /**
   * Singleton pattern to ensure single service instance
   */
  public static getInstance(): CognitoAuthService {
    if (!CognitoAuthService.instance) {
      CognitoAuthService.instance = new CognitoAuthService();
    }
    return CognitoAuthService.instance;
  }

  /**
   * Get or create Cognito Identity Provider client
   */
  private getCognitoClient(): CognitoIdentityProviderClient {
    if (!this.cognitoClient) {
      const clientConfig = this.configManager.getDefaultClientConfig();
      this.cognitoClient = new CognitoIdentityProviderClient(clientConfig);
    }
    return this.cognitoClient;
  }

  /**
   * Get or create Cognito Identity client
   */
  private getIdentityClient(): CognitoIdentityClient {
    if (!this.identityClient) {
      const clientConfig = this.configManager.getDefaultClientConfig();
      this.identityClient = new CognitoIdentityClient(clientConfig);
    }
    return this.identityClient;
  }

  /**
   * Get or create STS client
   */
  private getSTSClient(): STSClient {
    if (!this.stsClient) {
      const clientConfig = this.configManager.getDefaultClientConfig();
      this.stsClient = new STSClient(clientConfig);
    }
    return this.stsClient;
  }

  /**
   * Parse JWT token without verification (for client-side use)
   * Note: Token verification is handled by Cognito on the server side
   */
  private parseJWT(token: string): JWTPayload {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error(
        `Failed to parse JWT: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Exchange authorization code for tokens using Cognito OAuth2 endpoint
   */
  private async exchangeCodeForTokens(code: string): Promise<TokenResponse> {
    const config = this.configManager.getCognitoConfig();
    const urls = this.configManager.getCognitoUrls();

    const redirectUri =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : "http://localhost:3000/auth/callback";

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: config.userPoolWebClientId,
      code,
      redirect_uri: redirectUri,
    });

    const response = await fetch(urls.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token exchange failed: ${response.status} ${errorText}`);
    }

    return response.json();
  }

  /**
   * Get AWS credentials using Cognito Identity Pool
   */
  private async getAWSCredentials(idToken: string): Promise<AWSCredentials> {
    const config = this.configManager.getCognitoConfig();
    const identityClient = this.getIdentityClient();

    try {
      // Get identity ID
      const getIdResponse = await identityClient.send(
        new GetIdCommand({
          IdentityPoolId: config.identityPoolId,
          Logins: {
            [`cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`]:
              idToken,
          },
        })
      );

      if (!getIdResponse.IdentityId) {
        throw new Error("Failed to get identity ID");
      }

      // Get credentials for identity
      const getCredentialsResponse = await identityClient.send(
        new GetCredentialsForIdentityCommand({
          IdentityId: getIdResponse.IdentityId,
          Logins: {
            [`cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`]:
              idToken,
          },
        })
      );

      const credentials = getCredentialsResponse.Credentials;
      if (
        !credentials ||
        !credentials.AccessKeyId ||
        !credentials.SecretKey ||
        !credentials.SessionToken
      ) {
        throw new Error("Invalid credentials received");
      }

      return {
        accessKeyId: credentials.AccessKeyId,
        secretAccessKey: credentials.SecretKey,
        sessionToken: credentials.SessionToken,
        expiration: credentials.Expiration,
      };
    } catch (error) {
      throw new Error(
        `Failed to get AWS credentials: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Verify AWS credentials by making a test STS call
   */
  private async verifyCredentials(credentials: AWSCredentials): Promise<void> {
    try {
      const stsClient = new STSClient({
        region: this.configManager.getCognitoConfig().region,
        credentials: {
          accessKeyId: credentials.accessKeyId,
          secretAccessKey: credentials.secretAccessKey,
          sessionToken: credentials.sessionToken,
        },
      });

      await stsClient.send(new GetCallerIdentityCommand({}));
    } catch (error) {
      throw new Error(
        `AWS credentials verification failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Initiate sign-in by redirecting to Cognito Hosted UI
   */
  public async initiateSignIn(): Promise<void> {
    try {
      const urls = this.configManager.getCognitoUrls();

      if (typeof window !== "undefined") {
        window.location.href = urls.signIn;
      } else {
        throw new Error("Sign-in can only be initiated in browser environment");
      }
    } catch (error) {
      throw new Error(
        `Failed to initiate sign-in: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Handle the callback from Cognito Hosted UI
   */
  public async handleCallback(
    code: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      // Exchange code for tokens
      const tokenResponse = await this.exchangeCodeForTokens(code);

      // Parse ID token to get user info
      const idTokenPayload = this.parseJWT(tokenResponse.id_token);

      // Create user object
      const user: User = {
        id: idTokenPayload.sub,
        email: idTokenPayload.email,
        name: idTokenPayload.name || idTokenPayload.email,
        picture: idTokenPayload.picture,
      };

      // Create tokens object
      const tokens: AuthTokens = {
        accessToken: tokenResponse.access_token,
        idToken: tokenResponse.id_token,
        refreshToken: tokenResponse.refresh_token,
        expiresAt: Date.now() + tokenResponse.expires_in * 1000,
      };

      // Get and verify AWS credentials
      const awsCredentials = await this.getAWSCredentials(
        tokenResponse.id_token
      );
      await this.verifyCredentials(awsCredentials);

      return { user, tokens };
    } catch (error) {
      throw new Error(
        `Callback handling failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Refresh authentication tokens
   */
  public async refreshTokens(
    refreshToken: string
  ): Promise<{ user: User; tokens: AuthTokens }> {
    try {
      const config = this.configManager.getCognitoConfig();
      const urls = this.configManager.getCognitoUrls();

      const body = new URLSearchParams({
        grant_type: "refresh_token",
        client_id: config.userPoolWebClientId,
        refresh_token: refreshToken,
      });

      const response = await fetch(urls.tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Token refresh failed: ${response.status} ${errorText}`
        );
      }

      const tokenResponse: TokenResponse = await response.json();

      // Parse new ID token
      const idTokenPayload = this.parseJWT(tokenResponse.id_token);

      const user: User = {
        id: idTokenPayload.sub,
        email: idTokenPayload.email,
        name: idTokenPayload.name || idTokenPayload.email,
        picture: idTokenPayload.picture,
      };

      const tokens: AuthTokens = {
        accessToken: tokenResponse.access_token,
        idToken: tokenResponse.id_token,
        refreshToken: tokenResponse.refresh_token || refreshToken, // Some responses don't include new refresh token
        expiresAt: Date.now() + tokenResponse.expires_in * 1000,
      };

      return { user, tokens };
    } catch (error) {
      throw new Error(
        `Token refresh failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Initiate sign-out by redirecting to Cognito logout
   */
  public async initiateSignOut(): Promise<void> {
    try {
      const urls = this.configManager.getCognitoUrls();

      if (typeof window !== "undefined") {
        window.location.href = urls.signOut;
      } else {
        throw new Error(
          "Sign-out can only be initiated in browser environment"
        );
      }
    } catch (error) {
      throw new Error(
        `Failed to initiate sign-out: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Get current user information using access token
   */
  public async getCurrentUser(accessToken: string): Promise<User> {
    try {
      const cognitoClient = this.getCognitoClient();

      const response = await cognitoClient.send(
        new GetUserCommand({
          AccessToken: accessToken,
        })
      );

      const attributes = response.UserAttributes || [];
      const getAttributeValue = (name: string) =>
        attributes.find((attr) => attr.Name === name)?.Value;

      return {
        id: response.Username || "",
        email: getAttributeValue("email") || "",
        name: getAttributeValue("name") || getAttributeValue("email") || "",
        picture: getAttributeValue("picture"),
      };
    } catch (error) {
      throw new Error(
        `Failed to get current user: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  /**
   * Create AWS credential provider for SDK clients
   */
  public async createCredentialProvider(idToken: string) {
    const config = this.configManager.getCognitoConfig();

    // First get the identity ID
    const identityClient = this.getIdentityClient();
    const getIdResponse = await identityClient.send(
      new GetIdCommand({
        IdentityPoolId: config.identityPoolId,
        Logins: {
          [`cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`]:
            idToken,
        },
      })
    );

    if (!getIdResponse.IdentityId) {
      throw new Error("Failed to get identity ID for credential provider");
    }

    return fromCognitoIdentity({
      clientConfig: this.configManager.getDefaultClientConfig(),
      identityId: getIdResponse.IdentityId,
      logins: {
        [`cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}`]:
          idToken,
      },
    });
  }
}

export const authService = CognitoAuthService.getInstance();
