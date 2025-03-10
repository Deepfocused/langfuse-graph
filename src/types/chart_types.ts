import { ApexOptions } from 'apexcharts';

export interface GraphProps {
    height?: number;
}
export interface ChartProps {
    series: ApexOptions['series'];
    options: ApexOptions;
}
