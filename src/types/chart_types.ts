import { ApexOptions } from 'apexcharts';

// 사용 x
// export interface GraphProps {
//     height?: number;
// }
export interface ChartProps {
    series: ApexOptions['series'];
    options: ApexOptions;
}

/**
 인덱스 시그니쳐(Index Signature)는 {[key : T] : U}형식으로 
 객체가 여러 Key를 가질 수 있으며 Key와 매칭되는 value를 가지는 경우 사용 
 */

export interface LlmSummaryData {
    [key: string]: Array<number>;
}

export interface LlmCallCountData {
    [key: string]: number;
}
