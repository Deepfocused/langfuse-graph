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
        text: '🦾 Token TimeLine 🦾',
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
        stacked: true,
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
            columnWidth: '60%',
            horizontal: false,
            borderRadius: 5,
            borderRadiusApplication: 'end', // 'around', 'end'
            borderRadiusWhenStacked: 'last', // 'all', 'last'
            dataLabels: {
                position: 'center',
                total: {
                    enabled: true,
                    style: {
                        fontSize: '15px',
                        fontWeight: 900,
                        color: '#ffffff',
                    },
                },
            },
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
            formatter: (val: Array<number>): string => {
                // Number(val[0]) 이렇게 안해주면 오류 발생
                const startTime: number = Number(val[0]);
                const endTime: number = Number(val[1]);
                return `${startTime.toFixed(1)}~${endTime.toFixed(1)}s`;
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
ContentsProps 대신 any를 써야하는 이유 
Type error: Type 'OmitWithTag<ContentsProps, keyof PageProps, "default">' does not satisfy the constraint '{ [x: string]: never; }'.
Property 'height' is incompatible with index signature.
Type 'any' is not assignable to type 'never'.
*/
// 컴포넌트는 대문자
export default function Token({
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
                const url = new URL('/langfuse/token', window.location.origin);
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
                    let result: { [x: string]: any } = {};
                    try {
                        result = await response.json();
                    } catch (jsonError) {
                        console.error('Error fetching json:', jsonError);
                        setState((prevState) => ({
                            ...prevState,
                        }));
                    }

                    setState((prevState) => ({
                        ...prevState,
                        series: [
                            {
                                name: 'input token',
                                data: result['inputtoken'],
                            },
                            {
                                name: 'output token',
                                data: result['outputtoken'],
                            },
                        ],
                        options: {
                            xaxis: {
                                categories: result['timeline'],
                                group: {
                                    style: {
                                        fontSize: '14px',
                                        fontWeight: 700,
                                    },
                                    groups: result['modelandcount'],
                                },
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
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-2">
                    <span className="ml-4 rounded-md bg-gray-100 px-1 py-1 text-sm font-medium text-gray-700 ring-4 ring-gray-700/50">
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
                            className="mr-4 px-1 py-1 max-w-sm rounded-lg text-stone-900 bg-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-100"
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
