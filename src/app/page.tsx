'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit job');

      router.push(`/jobs/${data.jobId}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full"></div>
      </div>

      <div className="z-10 w-full max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            YT Shorts Automator
          </h1>
          <p className="text-slate-400 text-lg">
            Convert long YouTube videos into viral shorts using AI.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="backdrop-blur-xl bg-white/5 p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-slate-300 ml-1">YouTube Video URL</label>
            <input
              type="url"
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white font-semibold py-4 rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Triggering Worker...</span>
              </>
            ) : (
              <span>Create Viral Shorts</span>
            )}
          </button>

          <p className="text-xs text-slate-500">
            The worker runs on GitHub Actions. It will download the video, transcribe it, detect viral moments with Gemini 3 Flash, and process clips with FFmpeg.
          </p>
        </form>
      </div>
    </div>
  );
}
