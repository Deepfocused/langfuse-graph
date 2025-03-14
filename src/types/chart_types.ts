import { ApexOptions } from 'apexcharts';

// 사용 x
export interface GraphProps {
    height?: number;
    titlefontSize?: number;
    name?: string;
    userId?: string;
    traceId?: string;
    sessionId?: string;
}

export interface ChartProps<T = ApexOptions['series'], U = any> {
    series: T;
    options?: U;
}

/**
 인덱스 시그니쳐(Index Signature)는 {[key : T] : U}형식으로 
 객체가 여러 Key를 가질 수 있으며 Key와 매칭되는 value를 가지는 경우 사용 
 */

export interface LlmType<T = Array<Array<number>>> {
    [key: string]: T;
}
