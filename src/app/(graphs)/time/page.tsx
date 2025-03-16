'use client';

import { useEffect, useState } from 'react';
import type { GraphProps, ChartProps } from '@/types/chart_types';
import { transformDataForTime as transformData } from '@/utils/util';
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
const defaultChartOptions = (titlefontSize: number) => ({
    title: {
        text: '🎢 Inference Timeline 🎢',
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
        type: 'rangeBar',
        foreColor: '#FFFFFF',
        dropShadow: {
            enabled: true,
            color: '#FFFFFF',
            top: 0,
            left: 0,
            blur: 21,
            opacity: 0.21,
        },
        zoom: {
            enabled: false,
        },
    },
    // colors: ['#69d2e7', '#FF4560'],
    plotOptions: {
        bar: {
            barHeight: '30%',
            horizontal: true,
            rangeBarGroupRows: true,
        },
    },
    dataLabels: {
        enabled: true,
        style: {
            fontSize: '14px',
            colors: ['#FFFFFF'],
        },
        formatter: function (val: any) {
            return (val[1] - val[0]).toFixed(1) + 's';
        },
    },
    legend: {
        show: true,
        showForSingleSeries: true,
        position: 'top',
        horizontalAlign: 'center',
        fontSize: '16px',
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
            show: false,
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
        custom: function (opts: any) {
            const w = opts.ctx.w;
            let ylabel = '';
            if (
                w.config.series[opts.seriesIndex].data &&
                w.config.series[opts.seriesIndex].data[opts.dataPointIndex]
            ) {
                ylabel =
                    w.config.series[opts.seriesIndex].data[opts.dataPointIndex]
                        .x;
            }
            let seriesName = w.config.series[opts.seriesIndex].name
                ? w.config.series[opts.seriesIndex].name
                : '';
            const color = w.globals.colors[opts.seriesIndex];

            return (
                '<div class="apexcharts-tooltip-rangebar">' +
                '<div> <span class="series-name" style="color: ' +
                color +
                '">' +
                (seriesName ? seriesName : '') +
                '</span></div>' +
                '<div> <span class="category">' +
                ylabel +
                ' </span> <span class="value start-value">' +
                (opts.y2 - opts.y1) +
                '</span></div>' +
                '</div>'
            );
        },
    },
});

/*
GraphProps 대신 any를 써야하는 이유 
Type error: Type 'OmitWithTag<GraphProps, keyof PageProps, "default">' does not satisfy the constraint '{ [x: string]: never; }'.
Property 'height' is incompatible with index signature.
Type 'any' is not assignable to type 'never'.
*/
// 컴포넌트는 대문자

export default function Time({
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
                const url = new URL('/langfuse/time', window.location.origin);
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
                    const transformedData = transformData(result);
                    setState((prevState) => ({
                        ...prevState,
                        series: transformedData,
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
            type="rangeBar"
            height={height}
        />
    );
}
