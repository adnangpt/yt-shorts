'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function JobStatus() {
    const params = useParams();
    const jobId = params.id as string;
    const [status, setStatus] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const pollStatus = async () => {
            try {
                const res = await fetch(`/api/jobs/${jobId}`);
                if (!res.ok) throw new Error('Failed to fetch status');
                const data = await res.json();
                setStatus(data);

                if (data.status === 'completed' || data.status === 'failed') {
                    // Stop polling if done
                    return;
                }
            } catch (err: any) {
                setError(err.message);
            }
        };

        const interval = setInterval(pollStatus, 5000); // Poll every 5s
        pollStatus();

        return () => clearInterval(interval);
    }, [jobId]);

    const getStatusConfig = (statusStr: string) => {
        switch (statusStr) {
            case 'completed':
                return { color: 'text-green-400', label: 'Completed', icon: '✅' };
            case 'failed':
                return { color: 'text-red-400', label: 'Failed', icon: '❌' };
            case 'processing':
                return { color: 'text-blue-400', label: 'Processing at GitHub...', icon: '⚙️' };
            default:
                return { color: 'text-slate-400', label: 'Pending...', icon: '⏳' };
        }
    };

    const config = getStatusConfig(status?.status);

    return (
        <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
            <div className="z-10 w-full max-w-xl text-center space-y-8">
                <div className="backdrop-blur-xl bg-white/5 p-12 rounded-3xl border border-white/10 shadow-2xl space-y-8">
                    <div className="space-y-4">
                        <div className="text-6xl">{config.icon}</div>
                        <h2 className="text-3xl font-bold">Job Status</h2>
                        <p className={`text-xl font-medium ${config.color}`}>
                            {config.label}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-slate-400 text-sm">Job ID: {jobId}</p>

                        {status?.url && (
                            <a
                                href={status.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block text-blue-400 hover:text-blue-300 underline text-sm transition-colors"
                            >
                                View Workflow on GitHub
                            </a>
                        )}
                    </div>

                    {status?.status === 'completed' && (
                        <div className="pt-4 space-y-4">
                            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl text-sm">
                                Your shorts are ready! Download them from the GitHub Artifacts section of the link above.
                            </div>
                            <p className="text-xs text-slate-500">
                                Note: In a production version, we would automatically fetch and display the downloadable links here.
                            </p>
                        </div>
                    )}

                    {status?.status === 'failed' && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">
                            Something went wrong during processing. Check the GitHub logs for details.
                        </div>
                    )}

                    <div className="pt-6 border-t border-white/5">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="text-slate-500 hover:text-slate-300 transition-colors text-sm"
                        >
                            ← Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
