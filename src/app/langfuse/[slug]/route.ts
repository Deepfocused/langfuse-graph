// https://nextjs.org/docs/app/api-reference/functions/next-response
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// https://nextjs.org/docs/app/api-reference/file-conventions/route
import { type NextRequest, NextResponse } from 'next/server';
import { Langfuse } from 'langfuse';
import type { LlmType } from '@/types/chart_types';

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

const fetchObservationsData: any = async (userId: string, traceId: string) => {
    const observations: any = await langfuse.fetchObservations({
        userId,
        traceId,
    });
    return observations.data;
};

const processObservations = (
    observations: Array<any>,
    modelNames: Array<string>,
    startTime: string,
) => {
    const modelNumber: number = modelNames.length;
    const initializeArray = (length: number) =>
        Array.from({ length }, () => []);

    const llmLatency: Array<Array<number>> = initializeArray(modelNumber);
    const llmStartTime: Array<Array<number>> = initializeArray(modelNumber);
    const llmEndTime: Array<Array<number>> = initializeArray(modelNumber);
    const llmInputTokenCount: Array<Array<number>> =
        initializeArray(modelNumber);
    const llmOutputTokenCount: Array<Array<number>> =
        initializeArray(modelNumber);
    const llmToktalTokenCount: Array<Array<number>> =
        initializeArray(modelNumber);
    const llmCallCount: Array<number> = Array(modelNumber).fill(0);

    for (const observation of observations) {
        // 가장 최근 것 부터 처리
        if (observation.type === 'GENERATION') {
            const modelIndex = modelNames.indexOf(observation.model);
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
                llmInputTokenCount[modelIndex].push(observation.promptTokens);
                llmOutputTokenCount[modelIndex].push(
                    observation.completionTokens,
                );
                llmToktalTokenCount[modelIndex].push(observation.totalTokens);
                llmCallCount[modelIndex] += 1;
            }
        }
    }
    // 구조 분해 할당 사용
    return {
        llmLatency,
        llmStartTime,
        llmEndTime,
        llmInputTokenCount,
        llmOutputTokenCount,
        llmToktalTokenCount,
        llmCallCount,
    };
};

const createCombinedArray = (
    arr1: Array<Array<number>>,
    arr2: Array<Array<number>>,
    arr3: Array<Array<number>>,
    modelNames: Array<string>,
) => {
    return arr1.reduce<LlmType>((acc, subArray, i) => {
        subArray.forEach((value, j) => {
            const key = modelNames[i];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push([value, arr2[i][j], arr3[i][j]]);
        });
        return acc;
    }, {});
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {
    const searchParams: URLSearchParams = request.nextUrl.searchParams;
    const name: string = searchParams.get('name') || 'RUNE';
    const userId: string = searchParams.get('userId') || 'woongsik';
    const specificTraceId: string | null = searchParams.get('traceId');

    try {
        const traceSelected: any = await fetchTraceData(
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

        /* 💥 모델 이름 얻기 💥*/
        let modelNames: Array<string> = [];
        const observations: Array<any> = await fetchObservationsData(
            userId,
            traceSelected.id,
        );
        for (const observation of observations) {
            if (observation.type === 'GENERATION') {
                // GENERATION이 LLM 사용하는 부분
                if (
                    observation.model &&
                    !modelNames.includes(observation.model)
                ) {
                    modelNames.push(observation.model);
                }
            }
        }
        const startTime: string = traceSelected.createdAt;
        const {
            llmLatency,
            llmStartTime,
            llmEndTime,
            llmInputTokenCount,
            llmOutputTokenCount,
            llmToktalTokenCount,
            llmCallCount,
        } = processObservations(observations, modelNames, startTime);
        const { slug } = await params;

        switch (slug) {
            case 'time':
                const llmTimeData: LlmType = createCombinedArray(
                    llmStartTime,
                    llmEndTime,
                    llmLatency,
                    modelNames,
                );
                return NextResponse.json(llmTimeData, {
                    status: 200,
                });
            case 'token':
                const llmTokenData: LlmType = createCombinedArray(
                    llmStartTime,
                    llmEndTime,
                    llmToktalTokenCount,
                    modelNames,
                );
                return NextResponse.json(llmTokenData, { status: 200 });
            case 'call':
                const llmCallCountData = modelNames.reduce<LlmType<number>>(
                    (result, name, index) => {
                        result[name] = llmCallCount[index];
                        return result;
                    },
                    {},
                );
                return NextResponse.json(llmCallCountData, { status: 200 });
            case 'summary':
                const llmSummaryData = modelNames.reduce<
                    LlmType<Array<number>>
                >((result, name, index) => {
                    result[name] = [
                        llmLatency[index].reduce((a, b) => a + b, 0),
                        llmInputTokenCount[index].reduce((a, b) => a + b, 0),
                        llmOutputTokenCount[index].reduce((a, b) => a + b, 0),
                        llmCallCount[index],
                    ];
                    return result;
                }, {});
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
