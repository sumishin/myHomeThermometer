import * as importStyle from './LineChart.scss';
import * as CSSModules from 'react-css-modules';

import * as React from 'react';
import * as Recharts from 'Recharts';

import { StyleableComponent, StyleableComponentProps } from 'src/ts/components/StyleableComponent';

export interface LineChartData {
  timestamp: string;
  temperature?: number;
  humidity?: number;
}

const TICKS: LineChartData[] = [
  { timestamp: '00:00' },
  { timestamp: '01:00' },
  { timestamp: '02:00' },
  { timestamp: '03:00' },
  { timestamp: '04:00' },
  { timestamp: '05:00' },
  { timestamp: '06:00' },
  { timestamp: '07:00' },
  { timestamp: '08:00' },
  { timestamp: '09:00' },
  { timestamp: '10:00' },
  { timestamp: '11:00' },
  { timestamp: '12:00' },
  { timestamp: '13:00' },
  { timestamp: '14:00' },
  { timestamp: '15:00' },
  { timestamp: '16:00' },
  { timestamp: '17:00' },
  { timestamp: '18:00' },
  { timestamp: '19:00' },
  { timestamp: '20:00' },
  { timestamp: '21:00' },
  { timestamp: '22:00' },
  { timestamp: '23:00' }
];

export interface LineChartProps extends StyleableComponentProps {
  title: string;
  strokeColor: string;
  yDataKey: string;
  yDomain: [Recharts.AxisDomain, Recharts.AxisDomain];
  dataList: LineChartData[];
}

export class LineChartComponent extends StyleableComponent<LineChartProps, {}> {

  constructor(props: LineChartProps, context?: {}) {
    super(props, context);
  }

  public render(): JSX.Element {

    const data: LineChartData[] = TICKS.map((d, i) => {
      if (i === 0) {
        const topHit: LineChartData | undefined = this.props.dataList.find(fd => fd.timestamp === d.timestamp);
        return topHit ? topHit : d;
      }
      const prev: LineChartData = TICKS[i - 1];
      const hit: LineChartData | undefined = this.props.dataList.find(fd => {
        // リトライ時の誤差調整
        const rangeMaxString: string = d.timestamp.replace(':00', ':10');
        return prev.timestamp < fd.timestamp && fd.timestamp <= rangeMaxString;
      });
      return hit ? {...hit, timestamp: d.timestamp} : d;
    });

    return (
      <section className={this.props.styles.lineChartRoot}>
        <h3>{this.props.title}</h3>
        <Recharts.LineChart
          width={568}
          height={300}
          data={data}
          margin={{top: 5, right: 30, left: 20, bottom: 5}}
          >
          <Recharts.XAxis dataKey='timestamp' />
          <Recharts.YAxis type='number' domain={this.props.yDomain} />
          <Recharts.CartesianGrid strokeDasharray='3 3'/>
          <Recharts.Tooltip/>
          <Recharts.Line
            type='monotone'
            dataKey={this.props.yDataKey}
            stroke={this.props.strokeColor}
            activeDot={{r: 8}}
            />
        </Recharts.LineChart>
      </section>
    );
  }
}

//tslint:disable-next-line:no-any
const ComponentWithCSS: any = CSSModules(LineChartComponent, importStyle);
export const LineChart: React.ComponentClass<LineChartProps> = ComponentWithCSS;
