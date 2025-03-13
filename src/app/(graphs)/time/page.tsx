'use client';

import { useEffect, useState } from 'react';
import type { GraphProps, ChartProps } from '@/types/chart_types';
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
const defaultChartOptions = (fontSize: number) => ({
    title: {
        text: '🎢 Inference Timeline 🎢',
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
            fontSize: '14px',
            colors: ['#FFFFFF'],
        },
    },
    legend: {
        show: true,
        showForSingleSeries: true,
        position: 'top',
        horizontalAlign: 'center',
        offsetX: 0,
        offsetY: 0,
        fontSize: '16px',
        customLegendItems: ['Claude-3.5', 'Llama 3.3'],
    },
    fill: {
        type: 'solid',
        opacity: 1,
    },
    xaxis: {
        labels: {
            show: true,
            style: {
                fontSize: '14px',
            },
            formatter: (val: number): number => Math.round(val),
        },
        title: {
            text: '⏳ Time(s) ⌛',
            offsetY: 10,
            style: {
                fontSize: '16px',
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
});

export default function Time({
    height = 640,
    fontSize = 28,
    name = '',
    userId = '',
    traceId = '',
}: GraphProps) {
    const [state, setState] = useState<ChartProps>({
        series: [
            {
                data: [
                    {
                        x: 'Claude-3.5',
                        y: [0, 3],
                    },
                    {
                        x: 'Llama 3.3',
                        y: [0, 0],
                    },
                    {
                        x: 'All time',
                        y: [0, 10],
                    },
                ],
            },
        ],
        options: defaultChartOptions(fontSize),
    });

    const [id, setId] = useState<string>(traceId);

    useEffect(() => {
        setId(traceId);
    }, [traceId]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = new URL('/langfuse/time', window.location.origin);
                if (id) url.searchParams.append('traceId', id);
                if (name) url.searchParams.append('name', name);
                if (userId) url.searchParams.append('userId', userId);

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
                    // const data: Array<Array<number>> = Object.values(result);
                    setState((prevState) => ({
                        ...prevState,
                    }));
                }
            } catch (error) {
                setState((prevState) => ({
                    ...prevState,
                }));
            }
        };
        fetchData();
    }, [id]);

    return (
        <ReactApexChart
            className="mx-8 my-6"
            options={state.options}
            series={state.series}
            type="rangeBar"
            height={height}
        />
    );
}
