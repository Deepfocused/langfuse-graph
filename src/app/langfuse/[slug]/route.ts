// https://nextjs.org/docs/app/api-reference/functions/next-response
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// https://nextjs.org/docs/app/api-reference/file-conventions/route
import { NextRequest, NextResponse } from 'next/server';
import { Langfuse } from 'langfuse';

const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
    secretKey: process.env.LANGFUSE_SECRET_KEY || '',
    baseUrl: process.env.LANGFUSE_BASE_URL,
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {
    const url = request.nextUrl;
    console.log('Http method: ', url);

    const { slug } = await params;
    if (slug === 'time') {
        try {
            // Get traces with timing information
            const traces = await langfuse.traces.get({
                startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // last 24 hours
                endTime: new Date(),
                limit: 10,
            });

            // Process trace timing data
            const timelineData = traces.map((trace) => ({
                startTime: trace.startTime,
                endTime: trace.endTime,
                duration: trace.duration,
                name: trace.name,
                model: trace.model, // if available
            }));

            return NextResponse.json({ data: timelineData }, { status: 200 });
        } catch (error) {
            return NextResponse.json(
                { error: 'Failed to fetch trace timing data' },
                { status: 500 },
            );
        }
    }

    return NextResponse.json({ success: 'ok!' }, { status: 200 });
}
