"use strict"

/*
const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({
    region: 'ap-northeast-1'
});
const deviceNamePrefix = 'myRaspberryPi3_';
*/

const toUnixTime = (date) => {
  return Math.floor(date.getTime() / 1000);
}

const getUTCNow = () => {
  // AWS Lambda で new Date() するとUTC
  return new Date();
}

const getPrevMonthString = (now) => {
  const yyyy = now.getFullYear();
  const month = now.getMonth();
  if (month === 0) {
    return `${yyyy - 1}12`;
  }
  return `${yyyy}${month}`;
}

const readData = () => {


}

exports.handler = async (_event) => {
  console.log(getPrevMonthString(new Date('2018/1/1 00:00:00')));
};

exports.handler();