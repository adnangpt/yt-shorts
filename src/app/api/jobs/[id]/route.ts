import { NextResponse } from 'next/server';
import { getWorkflowStatus } from '@/lib/github';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const jobId = params.id;
        const status = await getWorkflowStatus(jobId);

        return NextResponse.json(status);
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
