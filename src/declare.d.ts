//WebpackのDefinePluginの型定義

declare var BUILD_DATE_TIME: string;
declare var VERSION: string;
declare var ENV: Envelopment;

//環境設定
declare interface Envelopment {
  awsRegion: string;
  cognito: CognitoEnvelopment;
  appSync: AwsAppSyncEnvelopment;
}

declare interface CognitoEnvelopment {
  identityPoolId: string;
  userPoolId: string;
  clientId: string;
}

declare interface AwsAppSyncEnvelopment {
  graphqlEndpoint: string;
}

//
// file-loaderに読ませるためのrequireで拡張子をresolveする為の型定義。
// https://github.com/Microsoft/TypeScript/issues/2709
//
declare module '*.css';
declare module '*.scss';
declare module '*.png';
declare module '*.jpg';
