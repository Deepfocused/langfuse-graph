'use client';

import { useEffect, useState } from 'react';
import type { GraphProps, ChartProps } from '@/types/chart_types';
// nextjs default로 서버사이드 렌더링을 함
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
}); // browser에서만 렌더링해야하므로 ssr을 끔

/*
agent내 멀티 llm별 호출 횟수 비교: 단일 질문에 대해, 특정 기간동안 각 역할을 하는 모델별로 부하 수준이 얼마나 다른지 보여주기
- Column Chart 사용 
*/

/*
GraphProps 대신 any를 써야하는 이유 
Type error: Type 'OmitWithTag<GraphProps, keyof PageProps, "default">' does not satisfy the constraint '{ [x: string]: never; }'.
Property 'height' is incompatible with index signature.
Type 'any' is not assignable to type 'never'.
*/
// 컴포넌트는 대문자
export default function Call({ height = 640 }: any) {
    const [state, setState] = useState<ChartProps>({
        series: [
            {
                name: 'Call',
                data: [400, 430],
            },
        ],
        options: {
            title: {
                text: '🍘 LLM Call Count 🍘',
                align: 'center',
                style: {
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                },
            },
            chart: {
                toolbar: {
                    show: true,
                    offsetX: 21,
                    offsetY: 0,
                },
                type: 'bar',
                foreColor: '#FFFFFF',
                dropShadow: {
                    enabled: true,
                    color: '#FFFFFF',
                    top: 0,
                    left: 0,
                    blur: 21,
                    opacity: 0.7,
                },
            },

            plotOptions: {
                bar: {
                    barHeight: '21%',
                    distributed: true,
                    horizontal: true,
                    dataLabels: {
                        position: 'center',
                    },
                },
            },
            colors: ['#69d2e7', '#FF4560'],
            dataLabels: {
                enabled: true,
                // textAnchor: 'start',
                style: {
                    colors: ['#FFFFFF'],
                },
            },
            legend: {
                show: true,
                showForSingleSeries: true,
                position: 'bottom',
                horizontalAlign: 'center',
                offsetX: 0,
                offsetY: 0,
                customLegendItems: ['Exaone 3.5', 'Llama 3.3'],
            },
            fill: {
                type: 'solid',
                opacity: 1,
            },
            xaxis: {
                categories: ['Exaone 3.5', 'LLama 3.3'],
            },
            tooltip: {
                theme: 'dark',
            },
        },
    });

    return (
        <ReactApexChart
            className="mx-8 mt-6"
            options={state.options}
            series={state.series}
            type="bar"
            height={height}
        />
    );
}
