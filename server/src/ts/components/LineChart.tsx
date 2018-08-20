import * as importStyle from './LineChart.scss';
import * as CSSModules from 'react-css-modules';

import * as React from 'react';
import * as Recharts from 'Recharts';

import { StyleableComponent, StyleableComponentProps } from 'src/ts/components/StyleableComponent';

export interface LineChartData {
  timestamp: string;
  temperature: number;
  humidity: number;
}

export interface LineChartProps extends StyleableComponentProps {
  title: string;
  strokeColor: string;
  yDataKey: string;
  domain: [Recharts.AxisDomain, Recharts.AxisDomain];
  dataList: LineChartData[];
}

export class LineChartComponent extends StyleableComponent<LineChartProps, {}> {

  constructor(props: LineChartProps, context?: {}) {
    super(props, context);
  }

  public render(): JSX.Element {
    return (
      <section className={this.props.styles.lineChartRoot}>
        <h3>{this.props.title}</h3>
        <Recharts.LineChart
          width={600}
          height={300}
          data={this.props.dataList}
          margin={{top: 5, right: 30, left: 20, bottom: 5}}
          >
          <Recharts.XAxis dataKey='timestamp'/>
          <Recharts.YAxis type='number' domain={this.props.domain} />
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
