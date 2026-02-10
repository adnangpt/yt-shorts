import { NextResponse } from 'next/server';
import { triggerWorkflow } from '@/lib/github';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
        }

        const jobId = `short_${Date.now()}`;

        // 1. Log job in Supabase (for Hybrid Cloud / Mobile access)
        const { error: dbError } = await supabase
            .from('jobs')
            .insert([{
                id: jobId,
                youtube_url: url,
                status: 'pending'
            }]);

        if (dbError) {
            console.error('Supabase Error:', dbError);
            // We continue even if DB fails, to allow GitHub trigger to work as fallback
        }

        // 2. Optional: Still trigger GitHub Action as a backup
        // await triggerWorkflow(url, jobId);

        return NextResponse.json({ jobId });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
