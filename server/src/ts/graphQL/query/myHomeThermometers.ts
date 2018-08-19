import gql from 'graphql-tag';
import { DocumentNode } from 'graphql';
import { MyHomeThermometer } from 'src/ts/graphQL/types';

//tslint:disable-next-line:no-multiline-string
export const Query: DocumentNode = gql(`
query ($deviceName: String!, $limit: Int, $nextTimeStamp: Int) {
  myHomeThermometers(deviceName: $deviceName limit: $limit, nextTimeStamp: $nextTimeStamp) {
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
  limit: number;
  nextTimeStamp?: number;
}

export interface Result {
  myHomeThermometers: MyHomeThermometer[];
}
