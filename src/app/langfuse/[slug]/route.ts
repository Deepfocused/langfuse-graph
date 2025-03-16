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
    sessionId: string,
    userId: string,
    specificTraceId: string,
    name: string,
) => {
    if (specificTraceId) {
        const trace = await langfuse.fetchTrace(specificTraceId);
        return trace.data;
    } else {
        const traces = await langfuse.fetchTraces({ name, userId, sessionId });
        return traces.data[0];
    }
};

const fetchObservationsData = async (userId: string, traceId: string) => {
    const observations = await langfuse.fetchObservations({
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
    const llmCallCount: Array<number> = Array(modelNumber).fill(0);

    for (const observation of observations) {
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
                llmCallCount[modelIndex] += 1;
            }
        } else if (observation.type === 'SPAN') {
            const modelIndex = modelNames.indexOf('other');
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
        llmCallCount,
    };
};

const createCombinedArray = (
    arr1: Array<Array<number>>,
    arr2: Array<Array<number>>,
    modelNames: Array<string>,
) => {
    return arr1.reduce<LlmType>((acc, subArray, i) => {
        subArray.forEach((value, j) => {
            const key = modelNames[i];
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push([value, arr2[i][j]]);
        });
        return acc;
    }, {});
};

// 각 배열의 내부 배열을 오름차순으로 정렬하고, 정렬된 인덱스를 반환
const sortWithIndices = (array: Array<number>) => {
    const indexedArray = array.map((value, index) => ({ value, index }));
    indexedArray.sort((a, b) => a.value - b.value);
    return indexedArray.map((item) => item.index);
};

// 주어진 인덱스 순서에 따라 배열을 재정렬
const reorderArray = (array: Array<number>, indices: Array<number>) => {
    return indices.map((index) => array[index]);
};

// 배열 병합 [a,b,c],[d,e,f] => [[a,d],[b,e],[c,f]]
const mergeArrays = (
    arr1: Array<Array<number>>,
    arr2: Array<Array<number>>,
) => {
    return arr1.map((subArray, i) =>
        subArray.map((_, j) => [arr1[i][j], arr2[i][j]]),
    );
};

// 2차원 배열을 1차원 배열로 변환
const flattenArray = (arrays: Array<Array<number>>) => {
    return arrays.reduce((acc, subArray) => acc.concat(subArray), []);
};

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> },
) {
    const traces = await langfuse.fetchTraces();
    // console.log(traces);

    const { slug } = await params;

    // 프론트엔드에서 langfuse API 사용하기 위함
    if (slug === 'info') {
        return NextResponse.json(
            {
                publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
                secretKey: process.env.LANGFUSE_SECRET_KEY || '',
                baseUrl: process.env.LANGFUSE_BASE_URL || '',
            },
            { status: 200 },
        );
    }

    const searchParams: URLSearchParams = request.nextUrl.searchParams;
    const sessionId: string = searchParams.get('sessionId') || 'LGCNS';
    const userId: string = searchParams.get('userId') || 'woongsik';
    const specificTraceId: string = searchParams.get('traceId') || '';
    const name: string = searchParams.get('name') || 'RUNE';

    try {
        const traceSelected: Record<string, any> = await fetchTraceData(
            sessionId,
            userId,
            specificTraceId,
            name,
        );

        if (!traceSelected) {
            return NextResponse.json(
                { error: 'No trace found' },
                { status: 404 },
            );
        }

        /* 💥 모델 이름 얻기 💥*/
        let modelNames: Array<string> = [];
        const observations = await fetchObservationsData(
            userId,
            traceSelected.id,
        );
        for (const observation of observations) {
            if (observation.type === 'GENERATION') {
                // GENERATION이 LLM 사용하는 부분 - 고정된 값
                if (
                    observation.model &&
                    !modelNames.includes(observation.model)
                ) {
                    modelNames.push(observation.model);
                }
            } else if (observation.type === 'SPAN') {
                if (!modelNames.includes('other')) modelNames.push('other');
            }
        }
        const startTime: string = traceSelected.timestamp;
        const {
            llmLatency,
            llmStartTime,
            llmEndTime,
            llmInputTokenCount,
            llmOutputTokenCount,
            llmCallCount,
        } = processObservations(observations, modelNames, startTime);

        switch (slug) {
            case 'time':
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

                const groupedModelNumber = modelNames.reduce<
                    Record<string, number>
                >((acc, value, index) => {
                    acc[value] = llmStartTime[index].length;
                    return acc;
                }, {});

                return NextResponse.json(
                    {
                        timeline: mergedLlmTime,
                        inputtoken: flattenedLlmInputTokenCount,
                        outputtoken: flattenedllmOutputTokenCount,
                        modelandcount: groupedModelNumber,
                    },
                    { status: 200 },
                );
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
