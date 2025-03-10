'use client';

import { useEffect, useState } from 'react';
import type { GraphProps, ChartProps } from '@/types/chart_types';
// nextjs default로 서버사이드 렌더링을 함
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
}); // browser에서만 렌더링해야하므로 ssr을 끔

/*
GraphProps 대신 any를 써야하는 이유 
Type error: Type 'OmitWithTag<GraphProps, keyof PageProps, "default">' does not satisfy the constraint '{ [x: string]: never; }'.
Property 'height' is incompatible with index signature.
Type 'any' is not assignable to type 'never'.
*/
// 컴포넌트는 대문자
export default function Time({ height = 640 }: any) {
    /* 필요 데이터 
    전체 시간 구하기 - x 축
    Y축은 모델명
    각 LLM 별 구간 구하기(길이가 비중)
    */

    const [state, setState] = useState<ChartProps>({
        series: [
            {
                data: [
                    {
                        x: 'Exaone 3.5',
                        y: [0, 1],
                        // fillColor: '#008FFB',
                    },
                    {
                        x: 'Llama 3.3',
                        y: [1, 2],
                        // fillColor: '#FF4560',
                    },
                ],
            },
        ],
        options: {
            chart: {
                foreColor: '#FFFFFF',
                type: 'rangeBar',
                dropShadow: {
                    enabled: true,
                    color: '#fff',
                    top: 0,
                    left: 0,
                    blur: 21,
                    opacity: 0.7,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#008FFB', '#FF4560'],
            plotOptions: {
                bar: {
                    horizontal: true,
                    distributed: true,
                    barHeight: '21%',
                },
            },
            title: {
                text: '🎢 LLM Inference Time 🎢',
                align: 'center',
                style: {
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                },
            },
            legend: {
                show: true,
                showForSingleSeries: true,
                position: 'top',
                horizontalAlign: 'left',
                customLegendItems: ['Exaone 3.5', 'Llama 3.3'],
            },
            fill: {
                type: 'solid',
                opacity: 0.7,
            },
            xaxis: {
                title: {
                    text: '⏳ Time ⌛',
                },
            },
            grid: {
                xaxis: {
                    lines: {
                        show: true,
                    },
                },
                yaxis: {
                    lines: {
                        show: false,
                    },
                },
            },
        },
    });

    return (
        <ReactApexChart
            className="mx-8 mt-4"
            options={state.options}
            series={state.series}
            type="rangeBar"
            height={height}
        />
    );
}
