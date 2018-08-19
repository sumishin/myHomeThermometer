
import * as importStyle from './TimeLine.scss';
import * as CSSModules from 'react-css-modules';

import * as React from 'react';
import { Dispatch, Action } from 'redux';
import { RouteComponentProps } from 'react-router';
import { ApolloQueryResult } from 'apollo-client';
import { connect } from 'react-redux';
import * as moment from 'moment';

import { StoreStates } from 'src/ts/reducers/appReducers';
import { AsyncTaskState, initialAsyncTaskState } from 'src/commonTypes';
import { AppContextState } from 'src/ts/reducers/appContextReducer';
import { StyleableComponent, StyleableComponentProps } from 'src/ts/components/StyleableComponent';
import { MonthCalendar } from 'src/ts/components/MonthCalendar';
import { api } from 'src/ts/graphQL/api';
import * as GQL from 'src/ts/graphQL/query/myHomeThermometers';
import { MyHomeThermometer } from 'src/ts/graphQL/types';
import { appUtil } from 'src/appUtil';
import * as AppContextActions from 'src/ts/actions/AppContext';
import * as PushActions from 'src/ts/actions/PushActions';

const PAGE_SIZE: number = 10;

export interface MappedStateProps {
  app: AppContextState;
}

// react-routerのパスで指定されたパラメタ
export interface PathParams {
  yyyymm?: string;
}

interface DispatchProps {
  fetchTimeLine: (deviceName: string, limit: number, asyncTaskState: AsyncTaskState) => void;
  fetchMoreTimeLine: (
    deviceName: string,
    limit: number,
    nextTimeStamp: number,
    asyncTaskState: AsyncTaskState) => void;
  replacePath: (year: number, month: number) => void;
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

    this.onClickCalenderMonth = this.onClickCalenderMonth.bind(this);
    this.onClickMoreButton = this.onClickMoreButton.bind(this);
  }

  private getYYYYMM(): string {
    if (this.props.params.yyyymm) {
      return this.props.params.yyyymm;
    }

    const now: moment.Moment = moment();
    return now.format('YYYYMM');
  }

  private getDeviceName(): string {
    return `myRaspberryPi3_${this.getYYYYMM()}`;
  }

  private onClickCalenderMonth(year: number, month: number): void {

    this.props.replacePath(
      year,
      month
    );
  }

  private onClickMoreButton(e: React.MouseEvent<{}>): void {
    e.preventDefault();

    if (typeof(this.props.app.lastTimestamp) !== 'number') {
      throw Error('想定外');
    }

    const taskState: AsyncTaskState = {...initialAsyncTaskState};
    this.props.fetchMoreTimeLine(
      this.getDeviceName(),
      PAGE_SIZE,
      this.props.app.lastTimestamp,
      taskState);
    this.setState({ asyncTaskState: taskState });
  }

  private renderCalendar(): JSX.Element {

    const yyyymm: appUtil.YYYYMM = appUtil.parseYYYYMM(this.getYYYYMM());
    return (
      <div className={this.props.styles.calendar}>
        <MonthCalendar year={yyyymm.yyyy}
                       month={yyyymm.mm}
                       onClick={this.onClickCalenderMonth} />
      </div>
    );
  }

  private renderTimeLine(t: MyHomeThermometer, key: string): JSX.Element {
    const summary: string = `温度:${t.payload.temperature}, 湿度${t.payload.humidity}`;
    const timestamp: string = moment.unix(t.timestamp).local().format('DD日 HH:mm:ss');

    return (
      <article className={this.props.styles.timeLine} key={key}>
        <h3>
          <span className={this.props.styles.timestamp}>{timestamp}</span>
          {summary}
        </h3>
      </article>
    );
  }

  private renderMoreTimeLine(): JSX.Element {
    if (this.props.app.isMoreFetching) {
      return (
        <div className={this.props.styles.moreTimeline}>
          読み込み中
        </div>
      );
    }

    return (
      <div className={this.props.styles.moreTimeline}>
        <button className={this.props.styles.moreButton}
                onClick={this.onClickMoreButton}>
          もっと読み込む
        </button>
      </div>
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

    const yyyymm: appUtil.YYYYMM = appUtil.parseYYYYMM(this.getYYYYMM());
    if (this.props.app.timeline.length === 0) {
      return (
        <div className={this.props.styles.timeLines}>
          <div className={this.props.styles.nonTimeLine}>
            {`${yyyymm.mm}月の記録はありません`}
          </div>
        </div>
      );
    }

    const hasNextPage: boolean = typeof(this.props.app.lastTimestamp) === 'number';
    return (
      <div className={this.props.styles.timeLines}>
        {this.props.app.timeline.map((t, i) => this.renderTimeLine(t, `timeline-${i}`))}
        {hasNextPage ? this.renderMoreTimeLine() : null}
      </div>
    );
  }

  private renderBody(): JSX.Element {

    if (this.props.app.isFetching) {
      return (
        <div className={this.props.styles.loading}>
          読み込み中
        </div>
      );
    }

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
        {!this.props.app.isFetching && <h2 className={this.props.styles.title}>温度/湿度</h2>}
        {this.renderBody()}
      </section>
    );
  }

  public componentWillMount(): void {

    if (!appUtil.isValidYearAndMonthString(this.getYYYYMM())) {
      window.location.assign('/fatalError.html');
      return;
    }

    const taskState: AsyncTaskState = {...initialAsyncTaskState};
    this.props.fetchTimeLine(
      this.getDeviceName(),
      PAGE_SIZE,
      taskState);
    this.setState({ asyncTaskState: taskState });
  }

  public componentDidMount(): void {
    window.scrollTo(0, 0);
  }

  public componentWillReceiveProps(nextProps: TimeLineProps, _nextContext: {}): void {

    // パスの値が変わっていれば初回読み込み処理
    if (nextProps.params.yyyymm && this.props.params.yyyymm !== nextProps.params.yyyymm) {

      if (this.state.asyncTaskState) {
        this.state.asyncTaskState.isCancelRequested = true;
      }

      window.scrollTo(0, 0);

      if (!appUtil.isValidYearAndMonthString(nextProps.params.yyyymm)) {
        window.location.assign('/fatalError.html');
        return;
      }

      const taskState: AsyncTaskState = {...initialAsyncTaskState};
      this.props.fetchTimeLine(
        this.getDeviceName(),
        PAGE_SIZE,
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

const _fetchTimeLine: (dispatch: Dispatch<Action>, deviceName: string, limit: number, asyncTaskState: AsyncTaskState) => void
  = async (dispatch, deviceName, limit, taskState) => {
  dispatch(AppContextActions.setFetching(true));
  try {
    const result: ApolloQueryResult<GQL.Result>
      = await api.query<GQL.Result>({
        query: GQL.Query,
        variables: {
          deviceName: deviceName,
          limit: limit
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
    const timeLine: MyHomeThermometer[] = data.myHomeThermometers;
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

const _fetchMoreTimeLine: (
  dispatch: Dispatch<Action>,
  deviceName: string,
  limit: number,
  nextTimeStamp: number,
  asyncTaskState: AsyncTaskState) => void
  = async (dispatch, deviceName, limit, nextTimeStamp, taskState) => {
  dispatch(AppContextActions.setMoreFetching(true));
  try {
    const result: ApolloQueryResult<GQL.Result>
      = await api.query<GQL.Result>({
        query: GQL.Query,
        variables: {
          deviceName: deviceName,
          limit: limit,
          nextTimeStamp: nextTimeStamp
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
    const timeLine: MyHomeThermometer[] = data.myHomeThermometers;
    dispatch(AppContextActions.addData(timeLine));
  } catch (e) {
    console.error(e);
    api.commonQueryErrorPostProcess(taskState, e, () => {
      window.location.assign('/fatalError.html');
    });
  } finally {
    if (!taskState.isCancelRequested) {
      dispatch(AppContextActions.setMoreFetching(false));
    }
    taskState.finished = true;
  }
};

export function mapDispatchToProps(dispatch: Dispatch<Action>): DispatchProps {
  return {
    fetchTimeLine: (deviceName: string, limit: number, asyncTaskState: AsyncTaskState) => {
      _fetchTimeLine(dispatch, deviceName, limit, asyncTaskState);
    },
    fetchMoreTimeLine: (
      deviceName: string,
      limit: number,
      nextTimeStamp: number,
      asyncTaskState: AsyncTaskState) => {
      _fetchMoreTimeLine(dispatch, deviceName, limit, nextTimeStamp, asyncTaskState);
    },
    replacePath: (year: number, month: number) => {
      dispatch(PushActions.replaceTimeLine(year, month));
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
