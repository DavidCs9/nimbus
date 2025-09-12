/**
 * Debug page to check environment variables
 * This page should be removed in production
 */

export default function DebugEnvPage() {
  const envVars = {
    NEXT_PUBLIC_AWS_REGION: process.env.NEXT_PUBLIC_AWS_REGION,
    NEXT_PUBLIC_COGNITO_USER_POOL_ID:
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID,
    NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID:
      process.env.NEXT_PUBLIC_COGNITO_USER_POOL_WEB_CLIENT_ID,
    NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID:
      process.env.NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID,
    NEXT_PUBLIC_COGNITO_DOMAIN: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
  };

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Environment Variables Debug</h1>
      <p>
        <strong>Note:</strong> This page should be removed in production!
      </p>

      <h2>Environment Variables Status:</h2>
      <ul>
        {Object.entries(envVars).map(([key, value]) => (
          <li key={key} style={{ marginBottom: "10px" }}>
            <strong>{key}:</strong>{" "}
            <span
              style={{
                color: value ? "green" : "red",
                backgroundColor: "#f0f0f0",
                padding: "2px 4px",
                borderRadius: "4px",
              }}
            >
              {value ? `✓ ${value}` : "✗ Not set"}
            </span>
          </li>
        ))}
      </ul>

      <h2>Troubleshooting:</h2>
      <ol>
        <li>Make sure the .env.local file is in the root directory</li>
        <li>Restart the Next.js development server</li>
        <li>Check that all variable names start with NEXT_PUBLIC_</li>
        <li>Ensure there are no spaces around the = sign</li>
      </ol>

      <p>
        <a href="/login" style={{ color: "blue", textDecoration: "underline" }}>
          ← Back to Login
        </a>
      </p>
    </div>
  );
}
