'use client';

import { useEffect, useState } from 'react';
import type { GraphProps, ChartProps } from '@/types/chart_types';
// nextjs default로 서버사이드 렌더링을 함
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
}); // browser에서만 렌더링해야하므로 ssr을 끔

/*
요구사항
agent내 전체 소요시간 타임 라인 뷰 : 전체 중 llm 추론 구간은 어디인지, 비중이 얼마큼인지 보여주기(시간)
- timeline 차트 사용하기 - 시간에 따른
*/

/*
GraphProps 대신 any를 써야하는 이유 
Type error: Type 'OmitWithTag<GraphProps, keyof PageProps, "default">' does not satisfy the constraint '{ [x: string]: never; }'.
Property 'height' is incompatible with index signature.
Type 'any' is not assignable to type 'never'.
*/
// 컴포넌트는 대문자
export default function Time({ height = 640 }: any) {
    const [state, setState] = useState<ChartProps>({
        series: [
            {
                data: [
                    {
                        x: 'Exaone 3.5',
                        y: [0, 0.5],
                    },
                    {
                        x: 'Llama 3.3',
                        y: [1, 3],
                    },
                    {
                        x: 'All time',
                        y: [0, 4],
                    },
                ],
            },
        ],
        options: {
            title: {
                text: '🎢 LLM Inference Time 🎢',
                align: 'center',
                style: {
                    fontSize: '20px',
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
                type: 'rangeBar',
                foreColor: '#FFFFFF',
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
            colors: ['#69d2e7', '#FF4560', '#AB45C0'],
            plotOptions: {
                bar: {
                    horizontal: true,
                    distributed: true,
                    barHeight: '30%',
                },
            },
            dataLabels: {
                enabled: true,
                style: {
                    colors: ['#FFFFFF'],
                },
            },
            legend: {
                show: true,
                showForSingleSeries: true,
                position: 'top',
                horizontalAlign: 'center',
                offsetX: 0,
                offsetY: -10,
                customLegendItems: ['Exaone 3.5', 'Llama 3.3'],
            },
            fill: {
                type: 'solid',
                opacity: 1,
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
            tooltip: {
                theme: 'dark',
            },
        },
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/langfuse/time');
                const result = await response.json();

                setState((prevState) => ({
                    ...prevState,
                }));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    return (
        <ReactApexChart
            className="mx-8 mt-6"
            options={state.options}
            series={state.series}
            type="rangeBar"
            height={height}
        />
    );
}
