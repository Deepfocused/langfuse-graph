'use client';

import { useEffect, useState } from 'react';
import type { ChartProps } from '@/types/chart_types';
import { transformDataForSummary as transformData } from '@/utils/util';
import dynamic from 'next/dynamic';
import { useInfo } from '@/context/InfoContext';

const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
}); // browser에서만 렌더링해야하므로 ssr을 끔

const defaultChartOptions = (titlefontSize: number) => ({
    title: {
        text: '🔊 Summary 🔊',
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
        type: 'bar',
        foreColor: '#FFFFFF',
        dropShadow: {
            enabled: true,
            color: '#fff',
            top: 0,
            left: 0,
            blur: 21,
            opacity: 0.21,
        },
        zoom: {
            enabled: false,
        },
    },
    plotOptions: {
        bar: {
            horizontal: false,
            columnWidth: '60%',
            borderRadius: 5,
            borderRadiusApplication: 'end',
            dataLabels: {
                position: 'top',
            },
        },
    },
    dataLabels: {
        enabled: true,
        style: {
            fontSize: '14px',
            colors: ['#FFFFFF'],
        },
        offsetY: -18,
        formatter: function (val: number) {
            return val.toFixed();
        },
    },
    stroke: {
        show: true,
        width: 5,
        curve: 'smooth',
        colors: ['transparent'],
    },
    legend: {
        show: true,
        showForSingleSeries: true,
        position: 'top',
        horizontalAlign: 'center',
        fontSize: '16px',
        offsetY: -16,
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
        },
    },
    yaxis: {
        labels: {
            show: true,
            style: {
                fontSize: '14px',
            },
            formatter: (val: number): number => Math.round(val),
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
ContentsProps 대신 any를 써야하는 이유 
Type error: Type 'OmitWithTag<ContentsProps, keyof PageProps, "default">' does not satisfy the constraint '{ [x: string]: never; }'.
Property 'height' is incompatible with index signature.
Type 'any' is not assignable to type 'never'.
*/
// 컴포넌트는 대문자
export default function Summary({
    height = 640,
    titlefontSize = 28,
    showInfo = true,
}: any) {
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
                const url = new URL(
                    '/langfuse/summary',
                    window.location.origin,
                );
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
                    const transformedData = transformData(result);
                    setState((prevState) => ({
                        ...prevState,
                        series: transformedData,
                        options: {
                            xaxis: {
                                categories: [
                                    'latency(s)',
                                    'Input Token',
                                    'Output Token',
                                    'Call Count',
                                ],
                            },
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
            {showInfo && (
                <div className="flex items-center justify-center gap-4 mb-2">
                    <span className="rounded-md bg-gray-100 px-1 py-1 text-sm font-medium text-gray-700 ring-4 ring-gray-700/50">
                        <span>Project Name : </span>
                        <span className="text-red-500 font-bold">{name}</span>
                    </span>
                    <span className="rounded-md bg-red-100 px-1 py-1 text-sm font-medium text-red-700 ring-4 ring-red-700/50">
                        <span>User ID : </span>
                        <span className="font-black">{userId}</span>
                    </span>
                    <span className="rounded-md bg-yellow-100 px-1 py-1 text-sm font-medium text-yellow-700 ring-4 ring-yellow-700/50">
                        <span>Session ID : </span>
                        <span className="font-black">{sessionId}</span>
                    </span>
                    <span>
                        {/* sr-only : Screen Reader Only */}
                        <label htmlFor="traceIdSelect" className="sr-only">
                            Select Trace ID
                        </label>
                        <select
                            id="traceIdSelect"
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
                            className="px-1 py-1 max-w-sm rounded-lg text-stone-900 bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-100"
                        >
                            {Object.keys(info).map((id, index) => (
                                <option key={index} value={id}>
                                    {id}
                                </option>
                            ))}
                        </select>
                    </span>
                </div>
            )}
            <ReactApexChart
                className="mx-8 my-6"
                options={state.options}
                series={state.series}
                type="bar"
                height={height}
            />
        </>
    );
}
