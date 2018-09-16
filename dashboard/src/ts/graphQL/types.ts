//tslint:disable:no-reserved-keywords

export interface MyHomeThermometer {
  deviceName: string;
  timestamp: number;
  payload: Payload;
}

export interface Payload {
  deviceName: string;
  timestamp: number;
  humidity: number;
  temperature: number;
}
