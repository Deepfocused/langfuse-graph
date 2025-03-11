'use client';

import { useEffect, useState } from 'react';
import type { GraphProps, ChartProps } from '@/types/chart_types';
// nextjs default로 서버사이드 렌더링을 함
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
}); // browser에서만 렌더링해야하므로 ssr을 끔

/*
agent내 멀티 llm별 입출력 토큰 사용량 비교 뷰: 각 역할을 하는 llm별로 토큰 사용량이 많이 다름을 보여주기
- Column Chart 사용 - 시간에 따른
*/

/*
GraphProps 대신 any를 써야하는 이유 
Type error: Type 'OmitWithTag<GraphProps, keyof PageProps, "default">' does not satisfy the constraint '{ [x: string]: never; }'.
Property 'height' is incompatible with index signature.
Type 'any' is not assignable to type 'never'.
*/
// 컴포넌트는 대문자
export default function Token({ height = 640, font_size = 28 }: any) {
    const [state, setState] = useState<ChartProps>({
        series: [
            {
                name: 'Exaone 3.5',
                data: [31, 40, 28, 51, 42, 109, 200],
            },
            {
                name: 'Llama 3.3',
                data: [11, 32, 45, 32, 34, 52, 41],
            },
        ],
        options: {
            title: {
                text: '🦾 LLM Token Usage 🦾',
                align: 'center',
                style: {
                    fontSize: `${font_size}px`,
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
                foreColor: '#FFFFFF',
                height: 350,
                type: 'area',
                dropShadow: {
                    enabled: true,
                    color: '#FFFFFF',
                    top: 0,
                    left: 0,
                    blur: 21,
                    opacity: 0.7,
                },
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#69d2e7', '#FF4560'],
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '14px',
                },
            },
            stroke: {
                show: true,
                curve: 'smooth',
            },
            legend: {
                position: 'top',
                horizontalAlign: 'center',
                offsetX: 0,
                offsetY: 0,
                fontSize: '16px',
                customLegendItems: ['Exaone 3.5', 'Llama 3.3'],
            },
            fill: {
                type: 'solid',
                opacity: 0.5,
            },
            xaxis: {
                title: {
                    text: '⏳ Time ⌛',
                    offsetY: 10,
                    style: {
                        fontSize: '16px',
                    },
                },
                type: 'datetime',
                categories: [
                    '2018-09-19T00:00:00.000Z',
                    '2018-09-19T01:30:00.000Z',
                    '2018-09-19T02:30:00.000Z',
                    '2018-09-19T03:30:00.000Z',
                    '2018-09-19T04:30:00.000Z',
                    '2018-09-19T05:30:00.000Z',
                    '2018-09-19T06:30:00.000Z',
                ],
                labels: {
                    show: true,
                    style: {
                        fontSize: '14px',
                    },
                },
            },
            yaxis: {
                labels: {
                    show: true,
                    style: {
                        fontSize: '14px',
                    },
                },
            },
            tooltip: {
                theme: 'dark',
                // x: {
                //   format: 'dd/MM/yy HH:mm'
                //   }
            },
        },
    });

    return (
        <ReactApexChart
            className="mx-8 my-6"
            options={state.options}
            series={state.series}
            type="area"
            height={height}
        />
    );
}
