
import type { LlmType } from '@/types/chart_types';
// 데이터 변환 함수
export const transformDataForTime = (data: LlmType, x: string = 'Latency') => {
    return Object.keys(data).map((key) => ({
        name: key,
        data: data[key].map((item: Array<number>) => ({
            x: x,
            y: [item[0], item[1]],
        })),
    }));
};

export const transformDataForSummary = (
    data: Record<string, Array<number>>,
) => {
    return Object.keys(data).map((key) => ({
        name: key,
        data: data[key],
    }));
};
