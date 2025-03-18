import { ApexOptions } from 'apexcharts';

export interface ContentsProps {
    height?: number;
    titlefontSize?: number;
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

export interface TraceInfo {
    name: string | null | undefined;
    userId: string | null | undefined;
    sessionId: string | null | undefined;
}

export interface Infos {
    [key: string]: TraceInfo;
}

export interface InfoContextType {
    name: string;
    setName: (value: string) => void;
    userId: string;
    setUserId: (value: string) => void;
    sessionId: string;
    setSessionId: (value: string) => void;
    traceId: string;
    setTraceId: (value: string) => void;
    info: Infos;
    setInfo: (value: Infos) => void;
}
