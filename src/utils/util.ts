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

export const createCombinedArray = (
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
export const sortWithIndices = (array: Array<number>) => {
    const indexedArray = array.map((value, index) => ({ value, index }));
    indexedArray.sort((a, b) => a.value - b.value);
    return indexedArray.map((item) => item.index);
};

// 주어진 인덱스 순서에 따라 배열을 재정렬
export const reorderArray = (array: Array<number>, indices: Array<number>) => {
    return indices.map((index) => array[index]);
};

// 배열 병합 [a,b,c],[d,e,f] => [[a,d],[b,e],[c,f]]
export const mergeArrays = (
    arr1: Array<Array<number>>,
    arr2: Array<Array<number>>,
) => {
    return arr1.map((subArray, i) =>
        subArray.map((_, j) => [arr1[i][j], arr2[i][j]]),
    );
};

// 2차원 배열을 1차원 배열로 변환
export const flattenArray = (arrays: Array<Array<number>>) => {
    return arrays.reduce((acc, subArray) => acc.concat(subArray), []);
};
