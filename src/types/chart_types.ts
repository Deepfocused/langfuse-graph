import { ApexOptions } from 'apexcharts';

// 사용 x
// export interface GraphProps {
//     height?: number;
// }
export interface ChartProps {
    series: ApexOptions['series'];
    options: ApexOptions;
}
