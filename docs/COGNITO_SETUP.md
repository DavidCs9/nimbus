# AWS Cognito Setup Guide for Nimbus Console

This guide walks you through setting up AWS Cognito authentication for the Nimbus Console.

## Prerequisites

- AWS Account with appropriate permissions
- Access to AWS Console
- Basic understanding of AWS Cognito

## Step 1: Create Cognito User Pool

1. Navigate to AWS Cognito in the AWS Console
2. Click "Create user pool"
3. Choose "Email" as the sign-in option
4. Configure required attributes (email is required)
5. Choose password policy (recommended: strong password requirements)
6. Enable MFA if desired (recommended for production)
7. Complete the user pool creation

## Step 2: Configure Hosted UI

1. In your User Pool, go to "App integration" tab
2. Click "Create app client"
3. Choose "Public client" (for web applications)
4. Configure the following settings:

   - **Client name**: Nimbus Console
   - **Authentication flows**: Allow "ALLOW_USER_PASSWORD_AUTH" and "ALLOW_REFRESH_TOKEN_AUTH"
   - **OAuth 2.0 grant types**: Authorization code grant
   - **OAuth 2.0 scopes**:
     - email
     - openid
     - profile
     - aws.cognito.signin.user.admin

5. Set callback URLs:

   - Development: `http://localhost:3000/auth/callback`
   - Production: `https://yourdomain.com/auth/callback`

6. Set sign-out URLs:
   - Development: `http://localhost:3000`
   - Production: `https://yourdomain.com`

## Step 3: Configure Domain

1. In the User Pool, go to "App integration" > "Domain"
2. Choose either:
   - **Amazon Cognito domain**: Use a domain prefix (e.g., `nimbus-console`)
   - **Custom domain**: Use your own domain (requires SSL certificate)
3. Save the domain configuration

## Step 4: Create Identity Pool

1. Navigate to "Identity pools" in Cognito
2. Click "Create identity pool"
3. Choose "Authenticated access"
4. Add your User Pool as an authentication provider:
   - **User pool ID**: From Step 1
   - **App client ID**: From Step 2
5. Configure IAM roles for authenticated users

## Step 5: Configure IAM Roles

The Identity Pool will create IAM roles. Configure them with appropriate permissions:

### Authenticated Role Permissions

Add policies for the AWS services you want to access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "lambda:ListFunctions",
        "lambda:GetFunction",
        "lambda:InvokeFunction"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:ListAllMyBuckets", "s3:ListBucket", "s3:GetObject"],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:ListTables",
        "dynamodb:DescribeTable",
        "dynamodb:Query",
        "dynamodb:Scan"
      ],
      "Resource": "*"
    }
  ]
}
```

**Note**: Adjust permissions based on your security requirements and principle of least privilege.

## Step 6: Environment Configuration

1. Copy `.env.example` to `.env.local`
2. Fill in the values from your Cognito setup:

```bash
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_COGNITO_DOMAIN=your-domain-prefix
```

## Step 7: Test Authentication

1. Start the development server: `pnpm dev`
2. Navigate to `http://localhost:3000/login`
3. Click "Continue with AWS Cognito"
4. You should be redirected to the Cognito Hosted UI
5. Create a test account or sign in
6. Verify successful redirect to the dashboard

## Security Considerations

- **Never commit `.env.local`** to version control
- Use strong password policies
- Enable MFA for production environments
- Regularly rotate IAM role permissions
- Monitor CloudTrail logs for authentication events
- Consider using AWS WAF for additional protection

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Check callback URLs in app client configuration
2. **CORS errors**: Ensure proper domain configuration
3. **Permission denied**: Review IAM role policies
4. **Token exchange fails**: Verify app client settings and OAuth scopes

### Debugging Steps

1. Check browser developer tools for error messages
2. Verify environment variables are loaded correctly
3. Test OAuth flow manually using curl or Postman
4. Review AWS CloudTrail logs for authentication events

## Production Deployment

When deploying to production:

1. Update callback URLs to use your production domain
2. Configure custom domain for Cognito Hosted UI
3. Enable CloudTrail logging
4. Set up monitoring and alerting
5. Review and tighten IAM permissions
6. Enable advanced security features (risk detection, etc.)

## Support

For issues with this setup:

- Check AWS Cognito documentation
- Review AWS CloudTrail logs
- Consult AWS Support if needed
- Open an issue in the Nimbus Console repository
