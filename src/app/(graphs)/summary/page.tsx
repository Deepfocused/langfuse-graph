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
export default function Summary({
    height = 640,
    fontSize = 28,
    name = '',
    userId = '',
    traceId = '',
}: any) {
    const [state, setState] = useState<ChartProps>({
        series: [
            {
                name: 'Latency',
                data: [44, 55],
            },
            {
                name: 'Input Token',
                data: [76, 85],
            },
            {
                name: 'Output Token',
                data: [35, 41],
            },
            {
                name: 'Call Count',
                data: [35, 41],
            },
        ],
        options: {
            chart: {
                background: 'black',
                toolbar: {
                    show: true,
                    offsetX: 25,
                    offsetY: 0,
                },
                type: 'bar',
                foreColor: '#FFFFFF',
                dropShadow: {
                    enabled: true,
                    color: '#fff',
                    top: 0,
                    left: 0,
                    blur: 21,
                    opacity: 0.7,
                },
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '70%',
                    borderRadius: 2,
                    borderRadiusApplication: 'end',
                },
            },
            title: {
                text: '🔊 Summary 🔊',
                align: 'center',
                style: {
                    fontSize: `${fontSize}px`,
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                },
            },
            dataLabels: {
                enabled: true,
                style: {
                    fontSize: '14px',
                    colors: ['#FFFFFF'],
                },
            },
            stroke: {
                show: true,
                width: 1,
                curve: 'smooth',
                colors: ['transparent'],
            },
            legend: {
                show: true,
                showForSingleSeries: true,
                position: 'bottom',
                horizontalAlign: 'center',
                offsetX: 0,
                offsetY: 0,
                fontSize: '16px',
                customLegendItems: [
                    'Latency',
                    'Input Token',
                    'Output Token',
                    'Call Count',
                ],
            },
            fill: {
                type: 'solid',
                opacity: 1,
            },
            xaxis: {
                categories: ['Claude-3.5', 'Llama 3.3'],
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
                    ? `/langfuse/summary?traceId=${id}`
                    : '/langfuse/summary';
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
            type="bar"
            height={height}
        />
    );
}
