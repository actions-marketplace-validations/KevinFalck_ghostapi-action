# GhostAPI Security Scan

AI-powered API security audit for your CI/CD pipeline. Block insecure deployments automatically.

## Usage

```yaml
name: Security Scan

on:
  pull_request:
    paths:
      - 'openapi.json'
      - 'src/**'

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run GhostAPI Security Scan
        uses: ghostapi/security-scan@v1
        with:
          api-key: ${{ secrets.GHOST_API_KEY }}
          openapi-path: ./openapi.json
          min-grade: B
```

## Inputs

| Input | Required | Default | Description |
|-------|----------|---------|-------------|
| `api-key` | ✅ | - | Your GhostAPI API key (from CI/CD Pro subscription) |
| `openapi-path` | ✅ | - | Path to your OpenAPI spec file |
| `min-grade` | ❌ | `C` | Minimum grade to pass (A, B, C, D, F) |
| `fail-on-error` | ❌ | `true` | Whether to fail the workflow if scan fails |

## Outputs

| Output | Description |
|--------|-------------|
| `passed` | Whether the security check passed |
| `grade` | Security grade (A-F) |
| `score` | Security score (0-100) |
| `vulnerabilities` | Number of vulnerabilities found |
| `report-url` | URL to full report |

## Getting an API Key

1. Go to [ghost-systems.pages.dev/pricing](https://ghost-systems.pages.dev/pricing)
2. Subscribe to **CI/CD Pro** ($49/month)
3. You'll receive your API key via email
4. Add it to your repo as `GHOST_API_KEY` secret

## Example: Block PRs with Low Security Grade

```yaml
- name: GhostAPI Security Gate
  uses: ghostapi/security-scan@v1
  with:
    api-key: ${{ secrets.GHOST_API_KEY }}
    openapi-path: ./api/openapi.yaml
    min-grade: B  # Fail if grade < B
```

## License

MIT
