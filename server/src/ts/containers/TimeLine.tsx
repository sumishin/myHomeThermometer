
import * as importStyle from './TimeLine.scss';
import * as CSSModules from 'react-css-modules';

import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { RouteComponentProps } from 'react-router';
import { ApolloQueryResult } from 'apollo-client';
import { connect } from 'react-redux';
import * as moment from 'moment';
import * as ja from 'date-fns/locale/ja';
import InfiniteCalendar from 'react-infinite-calendar';

import { StoreStates } from 'src/ts/reducers/appReducers';
import { AsyncTaskState, initialAsyncTaskState } from 'src/commonTypes';
import { AppContextState } from 'src/ts/reducers/appContextReducer';
import { StyleableComponent, StyleableComponentProps } from 'src/ts/components/StyleableComponent';
import { LineChart, LineChartData } from 'src/ts/components/LineChart';
import { api } from 'src/ts/graphQL/api';
import * as GQL from 'src/ts/graphQL/query/dailyHomeThermometers';
import { MyHomeThermometer } from 'src/ts/graphQL/types';
import { appUtil } from 'src/appUtil';
import * as AppContextActions from 'src/ts/actions/AppContext';
import * as PushActions from 'src/ts/actions/PushActions';

const MIN_DATE: Date = moment('20180801').toDate();

export interface MappedStateProps {
  app: AppContextState;
}

// react-routerのパスで指定されたパラメタ
export interface PathParams {
  yyyymmdd?: string;
}

interface DispatchProps {
  fetchTimeLine: (deviceName: string, fromTimeStamp: number, toTimeStamp: number, asyncTaskState: AsyncTaskState) => void;
  replacePath: (year: number, month: number, day: number) => void;
  didCanceled: () => void;
}

interface LocalState {
  asyncTaskState?: AsyncTaskState;
  endOfTimeLine: boolean;
}

export interface TimeLineProps extends MappedStateProps, DispatchProps, RouteComponentProps<PathParams, {}>, StyleableComponentProps {
}

export class TimeLineComponent extends StyleableComponent<TimeLineProps, LocalState> {
  constructor(props: TimeLineProps, context?: {}) {
    super(props, context);

    this.state = {
      asyncTaskState: undefined,
      endOfTimeLine: false
    };

    this.onSelectInfiniteCalendar = this.onSelectInfiniteCalendar.bind(this);
  }

  private getYYYYMMDD(target: TimeLineProps): string {
    if (target.params.yyyymmdd) {
      return target.params.yyyymmdd;
    }

    const now: moment.Moment = moment();
    return now.format('YYYYMMDD');
  }

  private getDeviceName(target: TimeLineProps): string {
    const yyyymmdd: appUtil.YYYYMMDD = appUtil.parseYYYYMMDD(this.getYYYYMMDD(target));
    const mmStr: string = 10 < yyyymmdd.mm ? yyyymmdd.mm.toString() : `0${yyyymmdd.mm}`;
    return `myRaspberryPi3_${yyyymmdd.yyyy}${mmStr}`;
  }

  private timestampToString(timestamp: number): string {
    return moment.unix(timestamp).local().format('HH:mm');
  }

  private onSelectInfiniteCalendar(date: string): void {
    const mDate: moment.Moment = moment(date);
    this.props.replacePath(mDate.year(), mDate.month() + 1, mDate.date());
  }

  private renderCalendar(): JSX.Element {

    const yyyymmdd: appUtil.YYYYMMDD = appUtil.parseYYYYMMDD(this.getYYYYMMDD(this.props));
    const selected: Date = new Date(yyyymmdd.yyyy, yyyymmdd.mm - 1, yyyymmdd.dd);
    //tslint:disable-next-line
    const locale: any = { locale: ja };
    return (
      <div className={this.props.styles.calendar}>
        <InfiniteCalendar
            width={352}
            height={400}
            selected={selected}
            minDate={MIN_DATE}
            locale={locale}
            onSelect={this.onSelectInfiniteCalendar}
          />
      </div>
    );
  }

  private renderChart(): JSX.Element {

    const dataList: LineChartData[] = this.props.app.timeline.map((d) => {
      return {
        timestamp: this.timestampToString(d.timestamp),
        temperature: d.payload.temperature,
        humidity: d.payload.humidity
      };
    });

    return (
      <div className={this.props.styles.charts}>
        <LineChart
          title='温度'
          strokeColor='#ff3300'
          yDataKey='temperature'
          yDomain={[0, 50]}
          dataList={dataList}
          />
        <LineChart
          title='湿度'
          strokeColor='#6600ff'
          yDataKey='humidity'
          yDomain={[0, 100]}
          dataList={dataList}
          />
      </div>
    );
  }

  private renderTimeLine(t: MyHomeThermometer, key: string): JSX.Element {
    const summary: string = `温度:${t.payload.temperature}, 湿度${t.payload.humidity}`;
    const timestamp: string = moment.unix(t.timestamp).local().format('HH:mm:ss');

    return (
      <article className={this.props.styles.timeLine} key={key}>
        <h3>
          <span className={this.props.styles.timestamp}>{timestamp}</span>
          {summary}
        </h3>
      </article>
    );
  }

  private renderTimeLines(): JSX.Element {

    if (this.props.app.isFetching) {
      return (
        <div className={this.props.styles.timeLines}>
          <div className={this.props.styles.loading}>
            読み込み中
          </div>
        </div>
      );
    }

    const yyyymmdd: appUtil.YYYYMMDD = appUtil.parseYYYYMMDD(this.getYYYYMMDD(this.props));
    if (this.props.app.timeline.length === 0) {
      return (
        <div className={this.props.styles.timeLines}>
          <div className={this.props.styles.nonTimeLine}>
            {`${yyyymmdd.mm}月${yyyymmdd.dd}日の記録はありません`}
          </div>
        </div>
      );
    }

    return (
      <div className={this.props.styles.timeLines}>
        {this.renderChart()}
        {this.props.app.timeline.map((t, i) => this.renderTimeLine(t, `timeline-${i}`))}
        </div>
    );
  }

  private renderBody(): JSX.Element {

    return (
      <div className={this.props.styles.container}>
        {this.renderCalendar()}
        {this.renderTimeLines()}
      </div>
    );
  }

  public render(): JSX.Element | null {

    // 未設定時はAppMainで強制的に設定される為、このコンポーネントでは未設定時は無視
    if (!this.props.app.authenticated) {
      return null;
    }

    return (
      <section className={this.styles.timeLineRoot}>
        <h2 className={this.props.styles.title}>温度/湿度</h2>
        {this.renderBody()}
      </section>
    );
  }

  public componentWillMount(): void {

    if (!appUtil.isValidDateString(this.getYYYYMMDD(this.props))) {
      window.location.assign('/fatalError.html');
      return;
    }

    const taskState: AsyncTaskState = {...initialAsyncTaskState};
    const date: moment.Moment = moment(this.getYYYYMMDD(this.props));
    this.props.fetchTimeLine(
      this.getDeviceName(this.props),
      date.unix(),
      date.add(1, 'day').unix(),
      taskState);
    this.setState({ asyncTaskState: taskState });
  }

  public componentDidMount(): void {
    window.scrollTo(0, 0);
  }

  public componentWillReceiveProps(nextProps: TimeLineProps, _nextContext: {}): void {

    // パスの値が変わっていれば初回読み込み処理
    if (nextProps.params.yyyymmdd && this.props.params.yyyymmdd !== nextProps.params.yyyymmdd) {

      if (this.state.asyncTaskState) {
        this.state.asyncTaskState.isCancelRequested = true;
      }

      window.scrollTo(0, 0);

      if (!appUtil.isValidDateString(nextProps.params.yyyymmdd)) {
        window.location.assign('/fatalError.html');
        return;
      }

      const taskState: AsyncTaskState = {...initialAsyncTaskState};
      const date: moment.Moment = moment(nextProps.params.yyyymmdd);
      this.props.fetchTimeLine(
        this.getDeviceName(nextProps),
        date.unix(),
        date.add(1, 'day').unix(),
        taskState);
      this.setState({ asyncTaskState: taskState });
    }
  }

  public componentWillUnmount(): void {

    if (this.state.asyncTaskState && !this.state.asyncTaskState.finished) {
      this.state.asyncTaskState.isCancelRequested = true;
      this.props.didCanceled();
      this.setState({ asyncTaskState: undefined });
    }
  }
}

export function mapStateToProps(state: StoreStates): MappedStateProps {
  return {
    app: state.appContext
  };
}

const _fetchTimeLine: (
  dispatch: Dispatch<Action>,
  deviceName: string,
  fromTimeStamp: number,
  toTimeStamp: number,
  asyncTaskState: AsyncTaskState) => void
  = async (dispatch, deviceName, fromTimeStamp, toTimeStamp, taskState) => {
  dispatch(AppContextActions.setFetching(true));
  try {
    const result: ApolloQueryResult<GQL.Result>
      = await api.query<GQL.Result>({
        query: GQL.Query,
        variables: {
          deviceName: deviceName,
          fromTimeStamp: fromTimeStamp,
          toTimeStamp: toTimeStamp
        }
      });
    const validResult: boolean = api.isValidQueryResult(taskState, result, () => {
      console.error(result.errors);
      window.location.assign('/fatalError.html');
    });
    if (!validResult) {
      return;
    }
    const data: GQL.Result = result.data;
    const timeLine: MyHomeThermometer[] = data.dailyHomeThermometers;
    dispatch(AppContextActions.setData(timeLine));
  } catch (e) {
    console.error(e);
    api.commonQueryErrorPostProcess(taskState, e, () => {
      window.location.assign('/fatalError.html');
    });
  } finally {
    if (!taskState.isCancelRequested) {
      dispatch(AppContextActions.setFetching(false));
    }
    taskState.finished = true;
  }
};

export function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
  return {
    fetchTimeLine: (deviceName: string, fromTimeStamp: number, toTimeStamp: number, asyncTaskState: AsyncTaskState) => {
      _fetchTimeLine(dispatch, deviceName, fromTimeStamp, toTimeStamp, asyncTaskState);
    },
    replacePath: (year: number, month: number, day: number) => {
      dispatch(PushActions.replaceTimeLine(year, month, day));
    },
    didCanceled: () => {
      dispatch(AppContextActions.setData([]));
      dispatch(AppContextActions.setFetching(false));
      dispatch(AppContextActions.setMoreFetching(false));
    }
  };
}

//tslint:disable-next-line:no-any
const ComponentWithCSS: any = CSSModules(TimeLineComponent, importStyle);
export const TimeLine: React.ComponentClass<{}> =
  connect(mapStateToProps, mapDispatchToProps)(ComponentWithCSS);
