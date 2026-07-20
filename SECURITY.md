# Security Policy

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Contact the project owner privately with a description, affected route or component, reproduction steps, and any suggested mitigation.

## Production deployment checklist

Before every production deployment:

- Use a unique 32+ character `ADMIN_SESSION_SECRET` and a strong `ADMIN_PASSWORD`.
- Store secrets only in the hosting provider's encrypted environment-variable store. Never commit a real `.env`.
- Use HTTPS on the production domain and confirm the response includes the configured security headers.
- Enable the hosting provider's WAF, DDoS protection, and request-rate controls.
- Connect Upstash Redis so shared rate limits coordinate across all instances.
- Restrict production database credentials to the application and migration jobs; use distinct pooled and direct URLs.
- Connect Vercel Blob only to this project and rotate its write token if access is suspected to have leaked.
- Review dependency updates and resolve any high or critical production advisories before deployment.
- Restrict repository and deployment access to trusted maintainers, with MFA enabled on those accounts.

## Security controls in the application

The application uses signed expiring admin sessions, server-side authorization, CSP nonces, security headers, authenticated upload validation, form validation, rate limits, and CI verification. These controls reduce risk but do not replace secure hosting configuration, access management, monitoring, or incident response.
