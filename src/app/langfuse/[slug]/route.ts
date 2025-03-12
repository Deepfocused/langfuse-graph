// https://nextjs.org/docs/app/api-reference/functions/next-response
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// https://nextjs.org/docs/app/api-reference/file-conventions/route
import { type NextRequest, NextResponse } from 'next/server';
import { Langfuse } from 'langfuse';
import type { LlmCallCountData } from '@/types/chart_types';

const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
    secretKey: process.env.LANGFUSE_SECRET_KEY || '',
    baseUrl: process.env.LANGFUSE_BASE_URL || '',
});

const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Asia/Seoul',
    hour12: false,
};

const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', options).format(date);
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {
    // const pathName: string = request.nextUrl.pathname;
    const searchParams: URLSearchParams = request.nextUrl.searchParams;

    /* 
        query로 받아서 페이지마다 표시할 수 있도록 함.

        🔰❗to do❗🔰
        -> 프론트에서 UI로 받아서 처리할 수 있도록 해야함
        -> 프론트에서도 langfuse api 사용해야함
    */
    const name: string = searchParams.get('name') || 'RUNE';
    const userId: string = searchParams.get('userId') || 'woongsik';
    const specificTraceId: string | null = searchParams.get('traceId');

    // 그래프 표시를 위해 필요한 변수들
    // 💥 모델 추가되면 수정해야 함.💥
    const llmModel: Array<string> = ['claude-3-5-sonnet-20241022', 'llama3.3'];
    let [allLatency, startTime, endTime]: [number, string, string] = [
        0,
        '',
        '',
    ];
    const llmLatency: [Array<number>, Array<number>] = [[], []];
    // const llmTime: [Array<string>, Array<string>] = [[], []];

    const llmInputTokenCount: [Array<number>, Array<number>] = [[], []];
    const llmOutputTokenCount: [Array<number>, Array<number>] = [[], []];
    const llmToktalTokenCount: [Array<number>, Array<number>] = [[], []];
    let llmCallCount: [number, number] = [0, 0];

    // https://js.reference.langfuse.com/classes/langfuse.Langfuse.html api 참고하여 작성
    try {
        let traceSelected: any;
        if (specificTraceId) {
            const trace = await langfuse.fetchTrace(specificTraceId);
            traceSelected = trace.data;
        } else {
            // 가장 최근것 하나만 가져온다.!
            const traces = await langfuse.fetchTraces({
                name,
                userId,
            });
            traceSelected = traces.data[0];
        }

        if (!traceSelected) {
            return NextResponse.json(
                { error: 'No trace found' },
                { status: 404 },
            );
        }

        allLatency = traceSelected.latency;
        startTime = formatTime(traceSelected.createdAt);
        endTime = formatTime(traceSelected.updatedAt);

        const traceId: string = traceSelected.id;
        const Observations: any = (
            await langfuse.fetchObservations({
                userId,
                traceId,
            })
        ).data;

        // 가장 최근에 실행된 것 부터 출력됨
        for (const Observation of Observations) {
            // 💥 모델 추가되면 수정해야 함.💥
            if (Observation.type === 'GENERATION')
                if (Observation.model === llmModel[0]) {
                    // "claude-3-5-sonnet-2024"
                    llmLatency[0].push(Observation.latency / 1000); // ms -> s
                    llmInputTokenCount[0].push(Observation.promptTokens);
                    llmOutputTokenCount[0].push(Observation.completionTokens);
                    llmToktalTokenCount[0].push(Observation.totalTokens);
                    llmCallCount[0] += 1;
                } else if (Observation.model === llmModel[1]) {
                    // "llama3.3"
                    llmLatency[1].push(Observation.latency / 1000); // ms -> s
                    llmInputTokenCount[1].push(Observation.promptTokens);
                    llmOutputTokenCount[1].push(Observation.completionTokens);
                    llmToktalTokenCount[1].push(Observation.totalTokens);
                    llmCallCount[1] += 1;
                    // console.log('Observation: ', Observation);
                } else {
                }
        }
        console.log(llmLatency);
        console.log(llmInputTokenCount);
        console.log(llmOutputTokenCount);
        console.log(llmToktalTokenCount);
    } catch (error) {
        console.error('Error fetching trace data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch trace data' },
            { status: 500 },
        );
    }

    const { slug } = await params;
    if (slug === 'time') {
        try {
            return NextResponse.json({ data: 'time' }, { status: 200 });
        } catch (error) {
            return NextResponse.json(
                { error: 'Failed to fetch trace time data' },
                { status: 500 },
            );
        }
    } else if (slug === 'token') {
        try {
            return NextResponse.json({ data: 'token' }, { status: 200 });
        } catch (error) {
            return NextResponse.json(
                { error: 'Failed to fetch trace token data' },
                { status: 500 },
            );
        }
    } else if (slug === 'call') {
        try {
            // result 가 객체!
            const llmCallCountData = llmModel.reduce<LlmCallCountData>(
                (result: LlmCallCountData, name: string, index: number) => {
                    result[name] = llmCallCount[index];
                    return result;
                },
                {},
            );
            return NextResponse.json(llmCallCountData, { status: 200 });
        } catch (error) {
            return NextResponse.json(
                { error: 'Failed to fetch trace call data' },
                { status: 500 },
            );
        }
    } else if (slug === 'summary') {
        try {
            return NextResponse.json({ data: 'summary' }, { status: 200 });
        } catch (error) {
            return NextResponse.json(
                { error: 'Failed to fetch trace summary data' },
                { status: 500 },
            );
        }
    } else {
        return NextResponse.json(
            { error: 'Something is wrong' },
            { status: 400 },
        );
    }
}
