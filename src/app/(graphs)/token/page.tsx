'use client';

import { useEffect, useState } from 'react';
import type { ChartProps } from '@/types/chart_types';
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
export default function Token({
    height = 640,
    fontSize = 28,
    name = '',
    userId = '',
    traceId = '',
}: any) {
    const [state, setState] = useState<ChartProps>({
        series: [
            {
                name: 'Claude-3.5',
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
                    fontSize: `${fontSize}px`,
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
                customLegendItems: ['Claude-3.5', 'Llama 3.3'],
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
                // type: 'datetime',
                categories: ['0', '8', '2', '3', '3', '4', '5'],
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

    const [id, setId] = useState<string>(traceId);

    useEffect(() => {
        setId(traceId);
    }, [traceId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = id
                    ? `/langfuse/token?traceId=${id}`
                    : '/langfuse/token';
                const response = await fetch(url); // ex) ?traceId=e1b1b1b1-1b1b-1b1b-1b1b-1b1b1b1b1b1b(인자로 받기)
                const result = await response.json();
                setState((prevState) => ({
                    ...prevState,
                }));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, [id]);

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
