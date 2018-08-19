import * as importStyle from './MonthCalendar.scss';
import * as CSSModules from 'react-css-modules';

import * as React from 'react';

import { StyleableComponent, StyleableComponentProps } from 'src/ts/components/StyleableComponent';
import { appUtil } from 'src/appUtil';

export interface MonthCalendarProps extends StyleableComponentProps {
  year: number;
  month?: number;
  onClick: (year: number, month: number) => void;
}

export class MonthCalendarComponent extends StyleableComponent<MonthCalendarProps, {}> {

  constructor(props: MonthCalendarProps, context?: {}) {
    super(props, context);

    this.onClickButton = this.onClickButton.bind(this);
  }

  private onClickButton(e: React.MouseEvent<{}>): void {
    e.preventDefault();

    const element: HTMLElement = e.currentTarget as HTMLButtonElement;
    if (!element.dataset.value) {
      throw new Error('value format error');
    }
    const yyyymm: appUtil.YYYYMM = appUtil.parseYYYYMM(element.dataset.value);
    this.props.onClick(yyyymm.yyyy, yyyymm.mm);
  }

  //tslint:disable-next-line:no-any
  private getMsGridStyle(x: number, y: number): any {

    // gap分があるので奇数で設定する
    // [0, 0] -> [1, 1]
    // [0, 1] -> [1, 3]
    // ...
    // [0, 5] -> [1, 11]
    // [1, 5] -> [3, 11]

    return {
      msGridColumn: x === 0 ? '1' : '3',
      msGridRow: `${(y * 2) + 1}`
    };
  }

  private renderMonthButton(month: number, isCurrent: boolean, x: number, y: number): JSX.Element {
    const value: string = `${this.props.year}${9 < month ? month : `0${month}` }`;
    const className: string = isCurrent ? this.props.styles.currentButton : this.props.styles.otherButton;
    return (
      <div key={`calendar-month-${month}-container`} style={this.getMsGridStyle(x, y)}>
        <button key={`calendar-month-${month}`}
                    className={className}
                    data-value={value}
                    onClick={this.onClickButton}>
          {`${month}月`}
        </button>
      </div>
    );
  }

  public render(): JSX.Element {
    const months: number[][] = [
      [1, 2],
      [3, 4],
      [5, 6],
      [7, 8],
      [9, 10],
      [11, 12]
    ];
    return (
      <div className={this.props.styles.monthCalendarRoot}>
        <div className={this.props.styles.yearContainer}>
        <button className={this.props.styles.backToOneYearButton}
                disabled={this.props.year <= appUtil.MIN_YEAR}
                data-value={`${this.props.year - 1}12`}
                onClick={this.onClickButton}>
          &lt;
        </button>
        <span className={this.props.styles.year}>{this.props.year}年</span>
        <button className={this.props.styles.forwardToOneYearButton}
                disabled={appUtil.MAX_YEAR <= this.props.year}
                data-value={`${this.props.year + 1}01`}
                onClick={this.onClickButton}>
          &gt;
        </button>
        </div>
        <div className={this.props.styles.monthContainer}>
          {months.map((row, y) => row.map((col, x) => this.renderMonthButton(col, col === this.props.month, x, y)))}
        </div>
      </div>
    );
  }

  public shouldComponentUpdate(nextProps: MonthCalendarProps, _nextState: {}, _nextContext: {}): boolean {
    return !(
      this.props.year === nextProps.year &&
      this.props.month === nextProps.month
    );
  }
}

//tslint:disable-next-line:no-any
const ComponentWithCSS: any = CSSModules(MonthCalendarComponent, importStyle);
export const MonthCalendar: React.ComponentClass<MonthCalendarProps> = ComponentWithCSS;
