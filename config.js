var net = require('net');
const Web3 = require('web3');
const web3 = new Web3(new Web3.providers.IpcProvider('/home/centos/ethdata/geth.ipc', net));
var log4js = require('log4js');
log4js.configure('./configs/log4js.json');
var logger = log4js.getLogger("startup");

const request = require('request');
const ABIEashPledgage = require('./contracts/abiEashPledgage.json');
const ABIPriceFeeder = require('./contracts/abiPriceFeeder.json');
const ABIEash = require('./contracts/abiEash.json');

const configdata = require('./contracts/configdata.json');
const eashPledgage = configdata.eashPledgage;
const priceFeeder = configdata.priceFeeder;
const eash=configdata.eash;

const MVPeashPledgage = new web3.eth.Contract(ABIEashPledgage,eashPledgage);
const MVPpriceFeeder = new web3.eth.Contract(ABIPriceFeeder,priceFeeder);
const MVPeash = new web3.eth.Contract(ABIEash,eash);

const privatekey = configdata.privatekey;
const controller = configdata.controller;

module.exports = {
  web3,MVPeashPledgage,MVPpriceFeeder,MVPeash,privatekey,eashPledgage,priceFeeder,eash,logger,request,controller
}
