import { NextResponse } from 'next/server';
import { triggerWorkflow } from '@/lib/github';

export async function POST(request: Request) {
    try {
        const { url } = await request.json();

        if (!url) {
            return NextResponse.json({ error: 'YouTube URL is required' }, { status: 400 });
        }

        const jobId = `short_${Date.now()}`;

        await triggerWorkflow(url, jobId);

        return NextResponse.json({ jobId });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
