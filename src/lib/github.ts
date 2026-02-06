export async function triggerWorkflow(url: string, jobId: string) {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_PAT;

    if (!owner || !repo || !token) {
        throw new Error('Missing GitHub configuration (OWNER, REPO, or PAT)');
    }

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/dispatches`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            event_type: 'process_video',
            client_payload: {
                url,
                jobId,
            },
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to trigger workflow: ${error}`);
    }

    return { success: true };
}

export async function getWorkflowStatus(jobId: string) {
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const token = process.env.GITHUB_PAT;

    if (!owner || !repo || !token) {
        throw new Error('Missing GitHub configuration');
    }

    // First, find the workflow run that matches the jobId in its payload or name
    // Since repository_dispatch doesn't return the run ID, we search for runs
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/actions/runs?event=repository_dispatch`, {
        headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch workflow runs');
    }

    const data = await response.json();
    // In a real app, we'd need a more robust way to match the run to the jobId.
    // For now, we'll look for the most recent run (as repository_dispatch is usually triggered 1:1)
    // Or we could use the Check Runs API if we had a more complex setup.
    const latestRun = data.workflow_runs[0];

    if (!latestRun) {
        return { status: 'pending' };
    }

    return {
        id: latestRun.id,
        status: latestRun.status === 'completed' ? (latestRun.conclusion === 'success' ? 'completed' : 'failed') : 'processing',
        url: latestRun.html_url,
    };
}
