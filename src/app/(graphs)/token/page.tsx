'use client';

import { useEffect, useState } from 'react';
import type { GraphProps, ChartProps } from '@/types/chart_types';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
}); // browser에서만 렌더링해야하므로 ssr을 끔

const defaultChartOptions = (fontSize: number) => ({
    title: {
        text: '🦾 Token TimeLine 🦾',
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
            text: '⏳ Time(s) ⌛',
            offsetY: 10,
            style: {
                fontSize: '16px',
            },
        },
        categories: [0],
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
    grid: {
        xaxis: {
            lines: {
                show: false,
            },
        },
        yaxis: {
            lines: {
                show: true,
            },
        },
    },
    tooltip: {
        theme: 'dark',
    },
});

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
}: GraphProps) {
    const [state, setState] = useState<ChartProps>({
        series: [
            {
                name: 'Claude-3.5',
                data: [0],
            },
            {
                name: 'Llama 3.3',
                data: [0],
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
                const url = id
                    ? `/langfuse/token?traceId=${id}`
                    : '/langfuse/token';
                const response = await fetch(url);
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
            type="area"
            height={height}
        />
    );
}
