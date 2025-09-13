/**
 * AWS Error Handling Utilities for Nimbus Console
 *
 * Provides comprehensive error handling, user-friendly error messages,
 * and retry logic for AWS service interactions.
 */

import { type EC2ServiceError } from "@/lib/types/ec2-types";

/**
 * AWS Error Codes and their user-friendly messages
 */
export const AWS_ERROR_MESSAGES: Record<string, string> = {
  // Authentication and Authorization Errors
  UnauthorizedOperation:
    "You don't have permission to perform this action. Please check your AWS IAM permissions.",
  "InvalidUserID.NotFound":
    "The specified user was not found. Please verify your AWS credentials.",
  AuthFailure:
    "Authentication failed. Please check your AWS credentials and try again.",
  TokenRefreshRequired: "Your session has expired. Please sign in again.",
  AccessDenied:
    "Access denied. You don't have sufficient permissions for this operation.",

  // Instance-specific Errors
  "InvalidInstanceID.NotFound":
    "The specified EC2 instance was not found. It may have been terminated or doesn't exist.",
  "InvalidInstanceID.Malformed":
    "The instance ID format is invalid. Please provide a valid instance ID (e.g., i-1234567890abcdef0).",
  IncorrectInstanceState:
    "The instance is not in the correct state for this operation. Please check the instance state and try again.",
  "InvalidInstance.NotFound": "The specified instance could not be found.",

  // Instance State Errors
  IncorrectState:
    "The instance is not in the correct state for this operation.",
  InvalidInstanceState:
    "The instance state is invalid for the requested operation.",
  OperationNotPermitted:
    "This operation is not permitted on the current instance state.",

  // Resource Limits and Quotas
  InstanceLimitExceeded:
    "You have reached the maximum number of instances allowed in your account.",
  InsufficientInstanceCapacity:
    "There is insufficient capacity to fulfill your request. Try again later or choose a different instance type.",
  RequestLimitExceeded:
    "You have exceeded the request rate limit. Please slow down your requests and try again.",
  ThrottlingException:
    "Your requests are being throttled. Please wait before retrying.",

  // Network and Connectivity Errors
  RequestTimeout:
    "The request timed out. Please check your network connection and try again.",
  NetworkError:
    "A network error occurred. Please check your internet connection.",
  ServiceUnavailable:
    "AWS service is temporarily unavailable. Please try again later.",
  InternalError: "An internal AWS error occurred. Please try again later.",

  // Instance Types and AMI Errors
  "InvalidAMIID.NotFound":
    "The specified AMI was not found or is not available in this region.",
  InvalidInstanceType:
    "The specified instance type is not valid or not available in this region.",
  UnsupportedOperation:
    "This operation is not supported for the specified instance type.",

  // Security and Key Errors
  "InvalidKeyPair.NotFound": "The specified key pair was not found.",
  "InvalidGroup.NotFound": "The specified security group was not found.",
  "InvalidSubnetID.NotFound": "The specified subnet was not found.",

  // Tagging Errors
  InvalidTagKey:
    "The tag key is invalid. Tag keys must be between 1-128 characters.",
  InvalidTagValue:
    "The tag value is invalid. Tag values must be between 0-256 characters.",
  TagLimitExceeded:
    "You have exceeded the maximum number of tags allowed per resource.",

  // Regional Errors
  OptInRequired:
    "You must opt-in to use this AWS region before you can access resources.",
  UnsupportedRegion: "The specified region is not supported or available.",

  // Default fallback
  UnknownError:
    "An unexpected error occurred. Please try again or contact support if the problem persists.",
};

/**
 * HTTP Status Code Messages
 */
export const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: "Bad Request - The request was invalid or cannot be processed.",
  401: "Unauthorized - Your AWS credentials are invalid or expired.",
  403: "Forbidden - You don't have permission to perform this action.",
  404: "Not Found - The requested resource was not found.",
  409: "Conflict - The request conflicts with the current state of the resource.",
  429: "Too Many Requests - You have exceeded the rate limit. Please slow down.",
  500: "Internal Server Error - AWS is experiencing issues. Please try again later.",
  502: "Bad Gateway - AWS service is temporarily unavailable.",
  503: "Service Unavailable - AWS service is temporarily unavailable.",
  504: "Gateway Timeout - The request to AWS timed out.",
};

/**
 * Error Classification
 */
export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export enum ErrorCategory {
  AUTHENTICATION = "authentication",
  AUTHORIZATION = "authorization",
  VALIDATION = "validation",
  RESOURCE = "resource",
  NETWORK = "network",
  RATE_LIMIT = "rate_limit",
  SERVICE = "service",
  UNKNOWN = "unknown",
}

/**
 * Enhanced Error Information
 */
export interface EnhancedEC2Error extends EC2ServiceError {
  severity: ErrorSeverity;
  category: ErrorCategory;
  userMessage: string;
  technicalMessage: string;
  suggestions: string[];
  documentationLink?: string;
}

/**
 * AWS Error Handler Class
 *
 * Provides methods to classify, enhance, and format AWS errors
 * for better user experience and debugging.
 */
export class AWSErrorHandler {
  /**
   * Enhances an EC2 service error with additional context and user-friendly information
   */
  public static enhanceError(error: EC2ServiceError): EnhancedEC2Error {
    const userMessage = this.getUserFriendlyMessage(error.code);
    const category = this.categorizeError(error.code);
    const severity = this.getSeverity(error.code, error.statusCode);
    const suggestions = this.getSuggestions(error.code, category);
    const documentationLink = this.getDocumentationLink(category);

    return {
      ...error,
      severity,
      category,
      userMessage,
      technicalMessage: error.message,
      suggestions,
      documentationLink,
    };
  }

  /**
   * Gets a user-friendly error message
   */
  private static getUserFriendlyMessage(errorCode: string): string {
    return AWS_ERROR_MESSAGES[errorCode] || AWS_ERROR_MESSAGES["UnknownError"];
  }

  /**
   * Categorizes the error type
   */
  private static categorizeError(errorCode: string): ErrorCategory {
    if (errorCode.includes("Auth") || errorCode.includes("Unauthorized")) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (errorCode.includes("Access") || errorCode.includes("Permission")) {
      return ErrorCategory.AUTHORIZATION;
    }
    if (errorCode.includes("Invalid") || errorCode.includes("Malformed")) {
      return ErrorCategory.VALIDATION;
    }
    if (
      errorCode.includes("NotFound") ||
      errorCode.includes("Limit") ||
      errorCode.includes("Capacity")
    ) {
      return ErrorCategory.RESOURCE;
    }
    if (errorCode.includes("Timeout") || errorCode.includes("Network")) {
      return ErrorCategory.NETWORK;
    }
    if (
      errorCode.includes("Throttling") ||
      errorCode.includes("RequestLimit")
    ) {
      return ErrorCategory.RATE_LIMIT;
    }
    if (errorCode.includes("Service") || errorCode.includes("Internal")) {
      return ErrorCategory.SERVICE;
    }
    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determines error severity
   */
  private static getSeverity(
    errorCode: string,
    statusCode?: number
  ): ErrorSeverity {
    // Critical errors that require immediate attention
    if (
      errorCode.includes("Auth") ||
      statusCode === 401 ||
      statusCode === 403
    ) {
      return ErrorSeverity.CRITICAL;
    }

    // High severity errors that block functionality
    if (
      errorCode.includes("NotFound") ||
      statusCode === 404 ||
      statusCode === 500
    ) {
      return ErrorSeverity.HIGH;
    }

    // Medium severity errors that may be temporary
    if (
      errorCode.includes("Throttling") ||
      statusCode === 429 ||
      statusCode === 503
    ) {
      return ErrorSeverity.MEDIUM;
    }

    // Low severity errors that are usually recoverable
    return ErrorSeverity.LOW;
  }

  /**
   * Provides actionable suggestions based on error type
   */
  private static getSuggestions(
    errorCode: string,
    category: ErrorCategory
  ): string[] {
    const suggestions: string[] = [];

    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        suggestions.push("Check your AWS credentials");
        suggestions.push("Verify your AWS access keys are correct");
        suggestions.push("Try signing out and signing in again");
        break;

      case ErrorCategory.AUTHORIZATION:
        suggestions.push("Contact your AWS administrator for permission");
        suggestions.push("Check your IAM role permissions");
        suggestions.push("Verify you have EC2 access in this region");
        break;

      case ErrorCategory.VALIDATION:
        suggestions.push("Check the format of your input parameters");
        suggestions.push("Verify the resource ID exists");
        suggestions.push("Ensure all required fields are provided");
        break;

      case ErrorCategory.RESOURCE:
        suggestions.push("Verify the resource exists in your account");
        suggestions.push("Check if you've reached service limits");
        suggestions.push(
          "Try selecting a different region or availability zone"
        );
        break;

      case ErrorCategory.NETWORK:
        suggestions.push("Check your internet connection");
        suggestions.push("Try again in a few moments");
        suggestions.push("Verify AWS service status");
        break;

      case ErrorCategory.RATE_LIMIT:
        suggestions.push("Wait a few moments before retrying");
        suggestions.push("Reduce the frequency of your requests");
        suggestions.push("Use pagination for large data sets");
        break;

      case ErrorCategory.SERVICE:
        suggestions.push("Try again in a few minutes");
        suggestions.push("Check AWS service health dashboard");
        suggestions.push("Contact AWS support if the issue persists");
        break;

      default:
        suggestions.push("Try again later");
        suggestions.push("Contact support if the problem continues");
        break;
    }

    return suggestions;
  }

  /**
   * Gets relevant documentation link for error category
   */
  private static getDocumentationLink(category: ErrorCategory): string {
    const baseUrl = "https://docs.aws.amazon.com/";

    switch (category) {
      case ErrorCategory.AUTHENTICATION:
      case ErrorCategory.AUTHORIZATION:
        return `${baseUrl}IAM/latest/UserGuide/`;

      case ErrorCategory.RESOURCE:
      case ErrorCategory.VALIDATION:
        return `${baseUrl}AWSEC2/latest/UserGuide/`;

      case ErrorCategory.RATE_LIMIT:
        return `${baseUrl}AWSEC2/latest/APIReference/query-api-troubleshooting.html`;

      case ErrorCategory.SERVICE:
      case ErrorCategory.NETWORK:
        return `${baseUrl}AWSEC2/latest/UserGuide/troubleshooting.html`;

      default:
        return `${baseUrl}AWSEC2/latest/UserGuide/`;
    }
  }

  /**
   * Formats an error for display in UI components
   */
  public static formatErrorForUI(error: EC2ServiceError): {
    title: string;
    message: string;
    severity: ErrorSeverity;
    actionable: boolean;
  } {
    const enhanced = this.enhanceError(error);

    return {
      title: this.getErrorTitle(enhanced.category),
      message: enhanced.userMessage,
      severity: enhanced.severity,
      actionable:
        enhanced.retryable || enhanced.category === ErrorCategory.VALIDATION,
    };
  }

  /**
   * Gets appropriate error title based on category
   */
  private static getErrorTitle(category: ErrorCategory): string {
    switch (category) {
      case ErrorCategory.AUTHENTICATION:
        return "Authentication Error";
      case ErrorCategory.AUTHORIZATION:
        return "Permission Denied";
      case ErrorCategory.VALIDATION:
        return "Invalid Request";
      case ErrorCategory.RESOURCE:
        return "Resource Error";
      case ErrorCategory.NETWORK:
        return "Connection Error";
      case ErrorCategory.RATE_LIMIT:
        return "Too Many Requests";
      case ErrorCategory.SERVICE:
        return "Service Error";
      default:
        return "Unexpected Error";
    }
  }

  /**
   * Determines if an error should trigger automatic retry
   */
  public static shouldRetry(error: EC2ServiceError): boolean {
    const retryableErrors = [
      "ThrottlingException",
      "RequestLimitExceeded",
      "ServiceUnavailable",
      "InternalError",
      "RequestTimeout",
      "NetworkError",
    ];

    const retryableStatusCodes = [429, 500, 502, 503, 504];

    return (
      error.retryable ||
      retryableErrors.includes(error.code) ||
      (error.statusCode
        ? retryableStatusCodes.includes(error.statusCode)
        : false)
    );
  }

  /**
   * Calculates retry delay with exponential backoff
   */
  public static getRetryDelay(attempt: number, maxDelay = 30000): number {
    const baseDelay = 1000; // 1 second
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

    // Add jitter to prevent thundering herd
    const jitter = Math.random() * 0.1 * delay;

    return Math.floor(delay + jitter);
  }
}

/**
 * Utility function to create an EC2ServiceError from unknown error
 */
export function createEC2Error(
  error: unknown,
  operation: string,
  instanceId?: string
): EC2ServiceError {
  const errorObj = error as {
    name?: string;
    message?: string;
    $metadata?: { httpStatusCode?: number };
  };

  return {
    code: errorObj.name || "UnknownError",
    message: errorObj.message || "An unknown error occurred",
    instanceId,
    retryable: AWSErrorHandler.shouldRetry({
      code: errorObj.name || "UnknownError",
      message: errorObj.message || "An unknown error occurred",
      retryable: false,
    }),
    statusCode: errorObj.$metadata?.httpStatusCode,
  };
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      const ec2Error = createEC2Error(error, "retry");
      if (!AWSErrorHandler.shouldRetry(ec2Error)) {
        throw error;
      }

      const delay = AWSErrorHandler.getRetryDelay(attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
