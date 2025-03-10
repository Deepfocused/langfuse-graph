'use client';

import { useEffect, useState } from 'react';
import type { GraphProps, ChartProps } from '@/types/chart_types';

// nextjs default로 서버사이드 렌더링을 함
import dynamic from 'next/dynamic';
const ReactApexChart = dynamic(() => import('react-apexcharts'), {
    ssr: false,
}); // browser에서만 렌더링해야하므로 ssr을 끔

// 컴포넌트는 대문자
export default function Time({ height = 640 }: GraphProps) {
    const [state, setState] = useState<ChartProps>({
        series: [
            {
                data: [
                    {
                        x: 'Operations',
                        y: [2800, 4500],
                    },
                    {
                        x: 'Customer Success',
                        y: [3200, 4100],
                    },
                    {
                        x: 'Engineering',
                        y: [2950, 7800],
                    },
                    {
                        x: 'Marketing',
                        y: [3000, 4600],
                    },
                    {
                        x: 'Product',
                        y: [3500, 4100],
                    },
                    {
                        x: 'Data Science',
                        y: [4500, 6500],
                    },
                    {
                        x: 'Sales',
                        y: [4100, 5600],
                    },
                ],
            },
        ],
        options: {
            chart: {
                height: 390,
                type: 'rangeBar',
                zoom: {
                    enabled: false,
                },
            },
            colors: ['#EC7D31', '#36BDCB'],
            plotOptions: {
                bar: {
                    horizontal: true,
                    isDumbbell: true,
                    dumbbellColors: [['#EC7D31', '#36BDCB']],
                },
            },
            title: {
                text: 'Paygap Disparity',
            },
            legend: {
                show: true,
                showForSingleSeries: true,
                position: 'top',
                horizontalAlign: 'left',
                customLegendItems: ['Female', 'Male'],
            },
            fill: {
                type: 'gradient',
                gradient: {
                    gradientToColors: ['#36BDCB'],
                    inverseColors: false,
                    stops: [0, 100],
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
        },
    });

    return (
        <div>
            <div id="chart">
                <ReactApexChart
                    options={state.options}
                    series={state.series}
                    type="rangeBar"
                    height={height}
                />
            </div>
        </div>
    );
}
