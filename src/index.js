const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

const API_URL = 'https://ghost-api.ghost-systems.workers.dev';

async function run() {
    try {
        // Get inputs
        const apiKey = core.getInput('api-key', { required: true });
        const openapiPath = core.getInput('openapi-path', { required: true });
        const minGrade = core.getInput('min-grade') || 'C';
        const failOnError = core.getInput('fail-on-error') !== 'false';

        // Read OpenAPI spec
        const fullPath = path.resolve(process.cwd(), openapiPath);
        if (!fs.existsSync(fullPath)) {
            throw new Error(`OpenAPI spec not found at: ${fullPath}`);
        }

        const openapiSpec = fs.readFileSync(fullPath, 'utf8');
        core.info(`📄 Loaded OpenAPI spec from ${openapiPath} (${openapiSpec.length} bytes)`);

        // Call GhostAPI
        core.info('🔍 Starting security scan...');
        
        const response = await fetch(`${API_URL}/ci/scan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-API-KEY': apiKey
            },
            body: JSON.stringify({
                openapi_spec: openapiSpec,
                min_grade: minGrade.toUpperCase()
            })
        });

        const result = await response.json();

        if (!response.ok) {
            if (response.status === 403) {
                core.setFailed('❌ CI/CD Pro subscription required. Visit https://ghost-systems.pages.dev/pricing');
                return;
            }
            throw new Error(result.error || `API Error: ${response.status}`);
        }

        // Set outputs
        core.setOutput('passed', result.passed);
        core.setOutput('grade', result.grade);
        core.setOutput('score', result.score);
        core.setOutput('vulnerabilities', result.vulnerabilities_count);
        core.setOutput('report-url', `https://ghost-systems.pages.dev/?audit_id=${result.audit_id}`);

        // Log results
        core.info('');
        core.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        core.info(`  GhostAPI Security Report`);
        core.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        core.info(`  Grade: ${result.grade} (Score: ${result.score}/100)`);
        core.info(`  Vulnerabilities: ${result.vulnerabilities_count}`);
        core.info(`  Critical: ${result.critical_count} | High: ${result.high_count}`);
        core.info(`  Min Required: ${minGrade}`);
        core.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        core.info('');

        // Pass/Fail
        if (result.passed) {
            core.info(`✅ ${result.message}`);
        } else {
            const errorMsg = `❌ ${result.message}`;
            if (failOnError) {
                core.setFailed(errorMsg);
            } else {
                core.warning(errorMsg);
            }
        }

    } catch (error) {
        core.setFailed(`GhostAPI Error: ${error.message}`);
    }
}

run();
