import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';
import { MyHomeThermometer } from 'src/ts/graphQL/types';

//tslint:disable-next-line:no-multiline-string
export const Query: DocumentNode = gql(`
query ($deviceName: String!, $fromTimeStamp: Int!, $toTimeStamp: Int!) {
  dailyHomeThermometers(deviceName: $deviceName fromTimeStamp: $fromTimeStamp, toTimeStamp: $toTimeStamp) {
    deviceName
    timestamp
    payload {
      humidity
      temperature
    }
  }
}`);

export interface Input {
  deviceName: string;
  fromTimeStamp: number;
  toTimeStamp: number;
}

export interface Result {
  dailyHomeThermometers: MyHomeThermometer[];
}
