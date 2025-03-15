'use client';

import { useEffect, useState } from 'react';
import type { GraphProps, ChartProps } from '@/types/chart_types';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
}); // browser에서만 렌더링해야하므로 ssr을 끔

const defaultChartOptions = (titlefontSize: number) => ({
    title: {
        text: '🍘 LLM Call Count 🍘',
        align: 'center',
        style: {
            fontSize: `${titlefontSize}px`,
            fontWeight: 'bold',
            color: '#FFFFFF',
        },
    },
    chart: {
        background: 'black',
        toolbar: {
            show: true,
            offsetX: 25,
            offsetY: 0,
        },
        type: 'donut',
        foreColor: '#FFFFFF',
        dropShadow: {
            enabled: true,
            color: '#FFFFFF',
            top: 0,
            left: 0,
            blur: 21,
            opacity: 0.21,
        },
    },
    // colors: ['#69d2e7', '#FF4560'],
    plotOptions: {},
    dataLabels: {
        enabled: true,
        style: {
            fontSize: '14px',
            colors: ['#FFFFFF'],
        },
        formatter(val: any, opts: any) {
            const name = opts.w.globals.labels[opts.seriesIndex];
            return [
                val.toFixed(1) +
                    '%' +
                    `(${opts.w.globals.series[opts.seriesIndex]})`,
            ];
        },
    },
    fill: {
        type: 'gradient',
    },
    legend: {
        show: true,
        showForSingleSeries: true,
        position: 'top',
        horizontalAlign: 'center',
        fontSize: '16px',
    },
});

/*
GraphProps 대신 any를 써야하는 이유 
Type error: Type 'OmitWithTag<GraphProps, keyof PageProps, "default">' does not satisfy the constraint '{ [x: string]: never; }'.
Property 'height' is incompatible with index signature.
Type 'any' is not assignable to type 'never'.
*/
// 컴포넌트는 대문자
export default function Call({
    height = 640,
    titlefontSize = 28,
    name = '',
    userId = '',
    traceId = '',
    sessionId = '',
}: GraphProps) {
    const [state, setState] = useState<ChartProps>({
        series: [],
        options: defaultChartOptions(titlefontSize),
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = new URL('/langfuse/call', window.location.origin);
                if (name) url.searchParams.append('name', name);
                if (traceId) url.searchParams.append('traceId', traceId);
                if (userId) url.searchParams.append('userId', userId);
                if (sessionId) url.searchParams.append('sessionId', sessionId);

                const response = await fetch(url.toString());

                if (!response.ok) {
                    setState((prevState) => ({
                        ...prevState,
                    }));
                } else {
                    let result;
                    try {
                        result = await response.json();
                    } catch (jsonError) {
                        setState((prevState) => ({
                            ...prevState,
                        }));
                    }
                    const data: Array<number> = Object.values(result);
                    const axisCategories: Array<string> = Object.keys(result);

                    setState((prevState) => ({
                        ...prevState,
                        series: data,
                        options: {
                            labels: axisCategories,
                        },
                    }));
                }
            } catch (error) {
                setState((prevState) => ({
                    ...prevState,
                }));
            }
        };
        fetchData();
    }, [name, userId, traceId, sessionId]);

    return (
        <ReactApexChart
            className="mx-8 my-6"
            options={state.options}
            series={state.series}
            type="donut"
            height={height}
        />
    );
}
