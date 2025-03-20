// https://nextjs.org/docs/app/api-reference/functions/next-response
// https://nextjs.org/docs/app/building-your-application/routing/route-handlers
// https://nextjs.org/docs/app/api-reference/file-conventions/route
import { type NextRequest, NextResponse } from 'next/server';
import { Langfuse } from 'langfuse';
import type { LlmType, Infos } from '@/types/chartTypes';
import {
    createCombinedArray,
    sortWithIndices,
    reorderArray,
    mergeArrays,
    flattenArray,
} from '@/utils/util';

const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
    secretKey: process.env.LANGFUSE_SECRET_KEY || '',
    baseUrl: process.env.LANGFUSE_BASE_URL || '',
});

const fetchTraceData = async (
    name: string | null,
    userId: string | null,
    sessionId: string | null,
    specificTraceId: string,
) => {
    if (specificTraceId) {
        const trace = await langfuse.fetchTrace(specificTraceId);
        return trace.data;
    } else {
        const traces = await langfuse.fetchTraces({ name, userId, sessionId });
        return traces.data[0];
    }
};

const fetchObservationsData = async (traceId: string) => {
    const observations = await langfuse.fetchObservations({
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

    for (const observation of observations) {
        if (observation.type === 'GENERATION') {
            const modelIndex = modelNames.indexOf(observation.model);
            if (modelIndex !== -1) {
                llmLatency[modelIndex].push(
                    parseFloat(
                        (Math.round(observation.latency) / 1000).toFixed(2),
                    ),
                ); // ms -> s

                if (observation.endTime) {
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
                } else {
                    llmStartTime[modelIndex].push(0.0);
                    llmEndTime[modelIndex].push(0.0);
                }

                llmInputTokenCount[modelIndex].push(observation.promptTokens);
                llmOutputTokenCount[modelIndex].push(
                    observation.completionTokens,
                );
            }
        } else if (observation.type === 'SPAN') {
            const modelIndex = modelNames.indexOf('other');
            if (modelIndex !== -1) {
                llmLatency[modelIndex].push(
                    parseFloat(
                        (Math.round(observation.latency) / 1000).toFixed(2),
                    ),
                ); // ms -> s
                if (observation.endTime) {
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
                } else {
                    llmStartTime[modelIndex].push(0.0);
                    llmEndTime[modelIndex].push(0.0);
                }
                llmInputTokenCount[modelIndex].push(observation.promptTokens);
                llmOutputTokenCount[modelIndex].push(
                    observation.completionTokens,
                );
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
    };
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {
    // default 50개만 가져옴
    const { slug } = await params;

    // 프론트엔드에서 정보를 요청할 때 사용 - name, userId, sessionId, traceId 반환
    if (slug === 'info') {
        // default 값 : 50개만 가져옴
        const traces = await langfuse.fetchTraces();

        const infos: Infos = {};
        for (const trace of traces.data) {
            infos[trace.id] = {
                name: trace.name,
                userId: trace.userId,
                sessionId: trace.sessionId,
            };
        }
        // name, userId, traceId, sessionId 반환하기
        return NextResponse.json(infos, { status: 200 });
    }

    const searchParams: URLSearchParams = request.nextUrl.searchParams;
    const specificTraceId: string = searchParams.get('traceId') || '';
    const sessionId: string | null = searchParams.get('sessionId') || null;
    const userId: string | null = searchParams.get('userId') || null;
    const name: string | null = searchParams.get('name') || null;

    try {
        // specificTraceId가 주어지지 않으면, 가장 최근것 불러옴 -
        const traceSelected: Record<string, any> = await fetchTraceData(
            name,
            userId,
            sessionId,
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
        const observations = await fetchObservationsData(traceSelected.id);
        for (const observation of observations) {
            if (observation.type === 'GENERATION') {
                // GENERATION이 LLM 사용하는 부분 - 고정된 값
                if (
                    observation.model &&
                    !modelNames.includes(observation.model)
                ) {
                    modelNames.push(observation.model);
                }
            }
        }

        modelNames.push('other');

        const startTime: string = traceSelected.timestamp;
        const {
            llmLatency,
            llmStartTime,
            llmEndTime,
            llmInputTokenCount,
            llmOutputTokenCount,
        } = processObservations(observations, modelNames, startTime);

        switch (slug) {
            case 'latency':
                const llmTimeData: LlmType = createCombinedArray(
                    llmStartTime,
                    llmEndTime,
                    modelNames,
                );
                return NextResponse.json(llmTimeData, {
                    status: 200,
                });
            case 'token':
                const exception = modelNames.indexOf('other');
                llmStartTime.splice(exception, 1);
                llmEndTime.splice(exception, 1);
                llmInputTokenCount.splice(exception, 1);
                llmOutputTokenCount.splice(exception, 1);
                modelNames.splice(exception, 1);

                // 각 내부 배열을 정렬하고, 다른 배열도 동일한 순서로 정렬
                const sortedllmStartTime = llmStartTime.map((subArray) => {
                    const indices = sortWithIndices(subArray);
                    return reorderArray(subArray, indices);
                });

                const sortedllmEndTime = llmEndTime.map((subArray, i) => {
                    const indices = sortWithIndices(llmStartTime[i]);
                    return reorderArray(subArray, indices);
                });

                const sortedllmInputTokenCount = llmInputTokenCount.map(
                    (subArray, i) => {
                        const indices = sortWithIndices(llmStartTime[i]);
                        return reorderArray(subArray, indices);
                    },
                );

                const sortedllmOutputTokenCount = llmOutputTokenCount.map(
                    (subArray, i) => {
                        const indices = sortWithIndices(llmStartTime[i]);
                        return reorderArray(subArray, indices);
                    },
                );
                //llmStartTime, llmEndTime 병합하여 새로운 배열 생성
                const mergedLlmTime = mergeArrays(
                    sortedllmStartTime,
                    sortedllmEndTime,
                ).flat();

                const flattenedLlmInputTokenCount = flattenArray(
                    sortedllmInputTokenCount,
                );
                const flattenedllmOutputTokenCount = flattenArray(
                    sortedllmOutputTokenCount,
                );

                const groupedModelNumber = modelNames.map((value, index) => {
                    return { title: value, cols: llmStartTime[index].length };
                });

                return NextResponse.json(
                    {
                        timeline: mergedLlmTime,
                        inputtoken: flattenedLlmInputTokenCount,
                        outputtoken: flattenedllmOutputTokenCount,
                        modelandcount: groupedModelNumber,
                    },
                    { status: 200 },
                );
            case 'summary-latency': {
                const exception = modelNames.indexOf('other');
                llmLatency.splice(exception, 1);
                modelNames.splice(exception, 1);

                const llmSummaryLatencyData = modelNames.reduce<
                    LlmType<Array<number>>
                >((result, name, index) => {
                    result[name] = [
                        llmLatency[index].reduce((a, b) => a + b, 0),
                    ];
                    return result;
                }, {});
                return NextResponse.json(llmSummaryLatencyData, {
                    status: 200,
                });
            }
            case 'summary-token': {
                const exception = modelNames.indexOf('other');
                llmInputTokenCount.splice(exception, 1);
                llmOutputTokenCount.splice(exception, 1);
                modelNames.splice(exception, 1);

                const llmSummaryTokenData = modelNames.reduce<
                    LlmType<Array<number>>
                >((result, name, index) => {
                    result[name] = [
                        llmInputTokenCount[index].reduce((a, b) => a + b, 0),
                        llmOutputTokenCount[index].reduce((a, b) => a + b, 0),
                    ];
                    return result;
                }, {});
                return NextResponse.json(llmSummaryTokenData, { status: 200 });
            }
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
