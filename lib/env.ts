type EnvIssue = { variable: string; message: string };

function collectEnvIssues(): EnvIssue[] {
  const issues: EnvIssue[] = [];
  const isProduction = process.env.NODE_ENV === "production";

  const jwtSecret = process.env.JWT_SECRET?.trim();
  if (!jwtSecret) {
    issues.push({ variable: "JWT_SECRET", message: "JWT_SECRET is required." });
  } else if (jwtSecret.length < 32) {
    issues.push({
      variable: "JWT_SECRET",
      message: "JWT_SECRET must be at least 32 characters.",
    });
  }

  if (!process.env.DATABASE_URL?.trim()) {
    issues.push({ variable: "DATABASE_URL", message: "DATABASE_URL is required." });
  }

  if (isProduction) {
    if (!process.env.UPSTASH_REDIS_REST_URL?.trim()) {
      issues.push({
        variable: "UPSTASH_REDIS_REST_URL",
        message: "UPSTASH_REDIS_REST_URL is required in production for auth rate limiting.",
      });
    }
    if (!process.env.UPSTASH_REDIS_REST_TOKEN?.trim()) {
      issues.push({
        variable: "UPSTASH_REDIS_REST_TOKEN",
        message: "UPSTASH_REDIS_REST_TOKEN is required in production for auth rate limiting.",
      });
    }
  }

  return issues;
}

/** Throws on misconfiguration so deploy/runtime fails fast instead of on first login. */
export function validateEnv(): void {
  const issues = collectEnvIssues();
  if (issues.length === 0) return;

  const details = issues.map((issue) => `${issue.variable}: ${issue.message}`).join("\n");
  throw new Error(`Environment validation failed:\n${details}`);
}

export function getEnvIssues(): EnvIssue[] {
  return collectEnvIssues();
}
