import { Store } from 'redux';
import { IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';
import { AWSAppSyncClient, AUTH_TYPE } from 'aws-appsync';
import { WatchQueryOptions, ApolloQueryResult } from 'apollo-client';
import { FetchResult } from 'apollo-link';

import { AppContextState } from 'src/ts/reducers/appContextReducer';
import { AsyncTaskState } from 'src/commonTypes';

export namespace api {

  let store_: Store;

  export const initialize: (store: Store) => void = (store) => {
    store_ = store;
  };

  const getCurrentAccessToken: () => Promise<string> = () => {
    return new Promise<string>((resolve, _reject) => {
      const state: AppContextState = store_.getState().appContext;
      resolve(state.accessToken);
    });
  };

  const createAppSyncClient: () => AWSAppSyncClient<{}> = () => {
    const fragmentMatcher: IntrospectionFragmentMatcher = new IntrospectionFragmentMatcher({
      introspectionQueryResultData: {
        __schema: {
          types: [] // no types provided
        }
      }
    });
    return new AWSAppSyncClient({
      url: ENV.appSync.graphqlEndpoint,
      region: ENV.awsRegion,
      auth: {
        type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
        jwtToken: async () => getCurrentAccessToken()
      },
      disableOffline: true,
      cacheOptions: {
        fragmentMatcher: fragmentMatcher
      }
    });
  };

  const appSyncClient: AWSAppSyncClient<{}> = createAppSyncClient();
  appSyncClient.defaultOptions = {
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'all'
    }
  };

  // ApolloQueryResultの検証、検証エラー時は共通のエラー処理もここで行う
  type ApiResult = ApolloQueryResult<{}> | FetchResult<{}>;
  export const isValidQueryResult: (
    taskState: AsyncTaskState,
    result: ApiResult,
    defaultErrorAction: () => void
  ) => boolean = (taskState, result, defaultErrorAction) => {

    if (taskState.isCancelRequested) {
      return false;
    }

    if (result.errors) {
      defaultErrorAction();
      return false;
    }

    return true;
  };

  //tslint:disable-next-line:no-any
  export function isTokenExpiredError(error: any): boolean {
    if (!error.networkError || error.networkError.statusCode !== 401) {
      return false;
    }

    //tslint:disable-next-line:no-any
    const result: any = error.networkError.result;
    if (!result || !Array.isArray(result.errors)) {
      return false;
    }

    //tslint:disable-next-line:no-any
    return result.errors.some((e: any) => {
      return e.errorType === 'UnauthorizedException' && e.message === 'Token has expired.';
    });
  }

  // Queryエラー時の共通処理
  // tslint:disable:no-any
  export const commonQueryErrorPostProcess: (
      taskState: AsyncTaskState,
      error: any,
      defaultAction: () => void
    ) => void = (taskState, error, defaultAction) => {

    if (taskState.isCancelRequested) {
      return;
    }

    console.error(error);
    defaultAction();
  };
  // tslint:enable:no-any

  export const query: <T>(options: WatchQueryOptions) => Promise<ApolloQueryResult<T>>
    = (options: WatchQueryOptions) => appSyncClient.query(options);
}
