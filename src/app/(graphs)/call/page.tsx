'use client';

import { useEffect, useState } from 'react';
import type { ChartProps } from '@/types/chart_types';
import dynamic from 'next/dynamic';
import { useInfo } from '@/context/InfoContext';

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
    plotOptions: {
        pie: {
            customScale: 1,
            donut: {
                size: '60%',
                labels: {
                    show: true,
                    total: {
                        show: true,
                    },
                },
            },
        },
    },
    // colors: ['#69d2e7', '#FF4560'],
    dataLabels: {
        enabled: true,
        style: {
            fontSize: '14px',
            colors: ['#FFFFFF'],
        },
        formatter(val: number, opts: any) {
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
ContentsProps 대신 any를 써야하는 이유 
Type error: Type 'OmitWithTag<ContentsProps, keyof PageProps, "default">' does not satisfy the constraint '{ [x: string]: never; }'.
Property 'height' is incompatible with index signature.
Type 'any' is not assignable to type 'never'.
*/
// 컴포넌트는 대문자
export default function Call({ height = 640, titlefontSize = 28 }: any) {
    const [state, setState] = useState<ChartProps>({
        series: [],
        options: defaultChartOptions(titlefontSize),
    });

    const {
        name,
        userId,
        sessionId,
        traceId,
        info,
        setName,
        setUserId,
        setSessionId,
        setTraceId,
    } = useInfo();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = new URL('/langfuse/call', window.location.origin);
                // if (name) url.searchParams.append('name', name);
                // if (userId) url.searchParams.append('userId', userId);
                // if (sessionId) url.searchParams.append('sessionId', sessionId);
                if (traceId) url.searchParams.append('traceId', traceId);

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
                        console.error('Error fetching json:', jsonError);
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
                console.error('Error fetching data:', error);
                setState((prevState) => ({
                    ...prevState,
                }));
            }
        };
        fetchData();
        // }, [name, userId, traceId, sessionId]);
    }, [traceId]);

    return (
        <>
            <div className="flex justify-center gap-4">
                <span className="rounded-md bg-gray-50 px-2 py-1 text-sm font-medium text-gray-600 ring-1 ring-gray-500/10">
                    Project Name: {name}
                </span>
                <span className="rounded-md bg-red-50 px-2 py-1 text-sm font-medium text-red-700 ring-1 ring-red-600/10">
                    User ID: {userId}
                </span>
                <span className="rounded-md bg-yellow-50 px-2 py-1 text-sm font-medium text-yellow-800 ring-1 ring-yellow-600/10">
                    Session ID: {sessionId}
                </span>
                <span>
                    <select
                        value={traceId}
                        onChange={(e) => {
                            const selectedTraceId = e.target.value;
                            setTraceId(selectedTraceId);

                            if (selectedTraceId && info[selectedTraceId]) {
                                const traceInfo = info[selectedTraceId];
                                setName(traceInfo.name || '');
                                setUserId(traceInfo.userId || '');
                                setSessionId(traceInfo.sessionId || '');
                            } else {
                                setName('');
                                setUserId('');
                                setSessionId('');
                            }
                        }}
                        className="py-1 px-2 block max-w-48 border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600"
                    >
                        <option value="">Select Trace ID</option>
                        {Object.keys(info).map((id, index) => (
                            <option key={index} value={id}>
                                {id}
                            </option>
                        ))}
                    </select>
                </span>
            </div>
            <ReactApexChart
                className="mx-8 my-6"
                options={state.options}
                series={state.series}
                type="donut"
                height={height}
            />
        </>
    );
}
