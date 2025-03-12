// https://nextjs.org/docs/app/api-reference/functions/next-response
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// https://nextjs.org/docs/app/api-reference/file-conventions/route
import { type NextRequest, NextResponse } from 'next/server';
import { Langfuse } from 'langfuse';

const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
    secretKey: process.env.LANGFUSE_SECRET_KEY || '',
    baseUrl: process.env.LANGFUSE_BASE_URL,
});

// Intl 은 javascript에서 제공하는 국제화 API
const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Seoul',
    hour12: false
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', options).format(date);
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {

    const pathName = request.nextUrl.pathname;
    const searchParams = request.nextUrl.searchParams;

    const name = searchParams.get('name') || "RUNE";
    const userId = searchParams.get('userId') || "woongsik";
    const specificTraceId = searchParams.get('traceId');
    
    // 1. 전체적으로 필요한 값 가져오기
    try {
        let traceSelected;
        if (specificTraceId) {
            const trace = await langfuse.fetchTrace(specificTraceId);
            traceSelected = trace.data;
        } else {
            // 가장 최근것 하나만 가져온다.!
            const traces = await langfuse.fetchTraces({ 
                name, 
                userId 
            });
            traceSelected = traces.data[0];
        }
        
        if (!traceSelected) {
            return NextResponse.json({ error: 'No trace found' }, { status: 404 });
        }
        
        const traceId = traceSelected?.id;
        const allLatency = traceSelected?.latency;
        const startTime = formatTime(traceSelected?.createdAt);
        const endTime = formatTime(traceSelected?.updatedAt);
        
        console.log();
        // console.log(traceSelected)
        // console.log(traceSelected.output.messages[1].response_metadata);
        // console.log('Trace data:', { traceId, allLatency, startTime, endTime });
        
        // // Return trace data to client
        // return NextResponse.json({ 
        //     trace: {
        //         id: traceId,
        //         latency: allLatency,
        //         startTime,
        //         endTime
        //     }
        // }, { status: 200 });
        
    } catch (error) {
        console.error('Error fetching trace data:', error);
        return NextResponse.json({ error: 'Failed to fetch trace data' }, { status: 500 });
    }
    
    const { slug } = await params;
    if (slug === 'time') {
        try {
            return NextResponse.json({ data: "time" }, { status: 200 });
        } catch (error) {
            return NextResponse.json(
                { error: 'Failed to fetch trace timing data' },
                { status: 500 },
            );
        }
    } else if (slug === 'token') {
        try {
            return NextResponse.json({ data: "token" }, { status: 200 });
        } catch (error) {
            return NextResponse.json(
                { error: 'Failed to fetch trace token data' },
                { status: 500 },
            );
        }
    } else if (slug === 'call') {
        try {
            return NextResponse.json({ data: "call" }, { status: 200 });
        } catch (error) {
            return NextResponse.json(
                { error: 'Failed to fetch trace call data' },
                { status: 500 },
            );
        }
    } else if (slug === "summary") {
        try {
            return NextResponse.json({ data: "summary" }, { status: 200 });
        } catch (error) {
            return NextResponse.json(
                { error: 'Failed to fetch trace call data' },
                { status: 500 },
            );
        }
    }
    else {
        return NextResponse.json({ error: 'Something is wrong' }, { status: 400 });
    }
}
