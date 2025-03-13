// https://nextjs.org/docs/app/api-reference/functions/next-response
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// https://nextjs.org/docs/app/api-reference/file-conventions/route
import { type NextRequest, NextResponse } from 'next/server';
import { Langfuse } from 'langfuse';
import type {
    LlmTokenType,
    LlmCallCountType,
    LlmSummaryType,
} from '@/types/chart_types';

const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
    secretKey: process.env.LANGFUSE_SECRET_KEY || '',
    baseUrl: process.env.LANGFUSE_BASE_URL || '',
});

const fetchTraceData = async (
    name: string,
    userId: string,
    specificTraceId: string | null,
) => {
    if (specificTraceId) {
        const trace = await langfuse.fetchTrace(specificTraceId);
        return trace.data;
    } else {
        const traces = await langfuse.fetchTraces({ name, userId });
        return traces.data[0];
    }
};

const fetchObservationsData = async (userId: string, traceId: string) => {
    const observations = await langfuse.fetchObservations({ userId, traceId });
    return observations.data;
};

const calculateMidTime = (
    time1: string,
    time2: string,
    startTime: string,
): number => {
    const date1 = new Date(time1);
    const date2 = new Date(time2);
    const startDate = new Date(startTime);
    const midTime = (date1.getTime() + date2.getTime()) / 2;
    return parseFloat(((midTime - startDate.getTime()) / 1000).toFixed(2)); // ms -> s
};

// 이차원 배열 오름차순 정렬
const sortArrays = (arrays: Array<Array<number>>) => {
    return arrays.map((innerArray) => innerArray.sort((a, b) => a - b));
};

const processObservations = (
    observations: any[],
    llmModel: string[],
    startTime: string,
) => {
    /* 💥 모델이 추가시 변경이 필요한 부분 💥*/
    const llmLatency: Array<Array<number>> = [[], []];
    const llmStartTime: Array<Array<number>> = [[], []];
    const llmEndTime: Array<Array<number>> = [[], []];
    const llmMidTime: Array<Array<number>> = [[], []];
    const llmInputTokenCount: Array<Array<number>> = [[], []];
    const llmOutputTokenCount: Array<Array<number>> = [[], []];
    const llmToktalTokenCount: Array<Array<number>> = [[], []];
    const llmCallCount: Array<number> = [0, 0];

    for (const observation of observations) {
        if (observation.type === 'GENERATION') {
            const modelIndex = llmModel.indexOf(observation.model);
            if (modelIndex !== -1) {
                llmLatency[modelIndex].push(
                    parseFloat(
                        (Math.round(observation.latency) / 1000).toFixed(2),
                    ),
                ); // ms -> s
                llmStartTime[modelIndex].push(
                    parseFloat(
                        (
                            (new Date(observation.startTime).getTime() -
                                new Date(startTime).getTime()) /
                            1000
                        ) // ms -> s
                            .toFixed(2),
                    ),
                );
                llmEndTime[modelIndex].push(
                    parseFloat(
                        (
                            (new Date(observation.endTime).getTime() -
                                new Date(startTime).getTime()) /
                            1000
                        ) // ms -> s
                            .toFixed(2),
                    ),
                );
                llmMidTime[modelIndex].push(
                    calculateMidTime(
                        observation.startTime,
                        observation.endTime,
                        startTime,
                    ),
                );

                llmInputTokenCount[modelIndex].push(observation.promptTokens);
                llmOutputTokenCount[modelIndex].push(
                    observation.completionTokens,
                );
                llmToktalTokenCount[modelIndex].push(observation.totalTokens);
                llmCallCount[modelIndex] += 1;
            }
        }
    }
    console.log(llmStartTime);
    console.log(llmEndTime);
    console.log(llmMidTime);
    // 구조 분해 할당 사용
    return {
        llmLatency,
        llmStartTime: sortArrays(llmStartTime),
        llmEndTime: sortArrays(llmEndTime),
        llmMidTime: sortArrays(llmMidTime),
        llmInputTokenCount,
        llmOutputTokenCount,
        llmToktalTokenCount,
        llmCallCount,
    };
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {
    const searchParams: URLSearchParams = request.nextUrl.searchParams;
    const name: string = searchParams.get('name') || 'RUNE';
    const userId: string = searchParams.get('userId') || 'woongsik';
    const specificTraceId: string | null = searchParams.get('traceId');

    /* 💥 모델이 추가시 변경이 필요한 부분 💥*/
    const llmModel: Array<string> = ['claude-3-5-sonnet-20241022', 'llama3.3'];

    try {
        const traceSelected = await fetchTraceData(
            name,
            userId,
            specificTraceId,
        );

        if (!traceSelected) {
            return NextResponse.json(
                { error: 'No trace found' },
                { status: 404 },
            );
        }

        const allLatency: number = parseFloat(traceSelected.latency.toFixed(2));
        const startTime: string = traceSelected.createdAt;

        const {
            llmLatency,
            llmStartTime,
            llmEndTime,
            llmMidTime,
            llmInputTokenCount,
            llmOutputTokenCount,
            llmToktalTokenCount,
            llmCallCount,
        } = processObservations(
            await fetchObservationsData(userId, traceSelected.id),
            llmModel,
            startTime,
        );

        const { slug } = await params;

        switch (slug) {
            case 'time':
                const llmTimeData = llmModel.reduce<LlmSummaryType>(
                    (result, name, index) => {
                        result[name] = [
                            llmLatency[index].reduce((a, b) => a + b, 0),
                            allLatency,
                        ];
                        return result;
                    },
                    {},
                );
                return NextResponse.json(llmTimeData, {
                    status: 200,
                });
            case 'token':
                const llmTokenData = llmModel.reduce<LlmTokenType>(
                    (result, name, index) => {
                        result[name] = [
                            llmMidTime[index], // x axis
                            llmToktalTokenCount[index], // y axis
                        ];
                        return result;
                    },
                    {},
                );
                return NextResponse.json(llmTokenData, { status: 200 });
            case 'call':
                const llmCallCountData = llmModel.reduce<LlmCallCountType>(
                    (result, name, index) => {
                        result[name] = llmCallCount[index];
                        return result;
                    },
                    {},
                );
                return NextResponse.json(llmCallCountData, { status: 200 });
            case 'summary':
                const llmSummaryData = llmModel.reduce<LlmSummaryType>(
                    (result, name, index) => {
                        result[name] = [
                            llmLatency[index].reduce((a, b) => a + b, 0),
                            llmInputTokenCount[index].reduce(
                                (a, b) => a + b,
                                0,
                            ),
                            llmOutputTokenCount[index].reduce(
                                (a, b) => a + b,
                                0,
                            ),
                            llmCallCount[index],
                        ];
                        return result;
                    },
                    {},
                );
                return NextResponse.json(llmSummaryData, { status: 200 });
            default:
                return NextResponse.json(
                    { error: 'Something is wrong' },
                    { status: 400 },
                );
        }
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch trace data' },
            { status: 500 },
        );
    }
}
