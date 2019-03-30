
//@flow
const config = require('../config');
const request = require('request');
const md5 = require('md5');
var count=0;
var sendSign=-1;
var priceArr = [];

function makePriceArr(){
  let timestamp=parseInt(new Date().getTime()/1000);
  let symbol="usdt_etz";
  let type="kline_1m";
  let url= "https://openapi.digifinex.com/v2/ticker?";
  let APIKEY = '5bc472faeb95d';
  let APISECRET = 'e523d8dddbd670ca0a43ce90f570023705bc472fa';
  let params = {type: type, symbol: symbol, timestamp: timestamp, apiKey: APIKEY, apiSecret: APISECRET};
  let keys = Object.keys(params).sort(), arr = [];
  keys.forEach(function(key){
    arr.push(params[key]);
  });
   let sign = md5(arr.join(''));
  let btcurl = url+"&symbol="+symbol+"&type="+type+"&timestamp="+timestamp+"&sign="+sign+"&apiKey="+APIKEY;
  request(btcurl,async function(errorbtc,responsebtc){
    let price_etz = JSON.parse(responsebtc.body).ticker.usdt_etz.last
    let price = parseInt(Number(price_etz)*10000)
console.log("length:",priceArr.length);
    console.log("price ===",price)
    if(priceArr.length<15){
      priceArr.push(price)
    }
  });
}

async function startFun(){
  if(priceArr.length>=15){
    let total=0;
    var len = priceArr.length
    console.log("len:",len)
    var i=0;
    for(var x=0;x< len;x++){
      i++;
      total+=Number(priceArr[x]);
      console.log("number:"+i+":"+total)
    }
    if(total>0 ){
      let price = total/len;
      console.log("total:",total)
      console.log("price:",price)
      let currentFeeded = await config.MVPpriceFeeder.methods.currentFeeded().call()
      console.log("priceFeeder:",config.priceFeeder)
let uploadPrice = config.MVPpriceFeeder.methods['uploadPrice(uint256)'](parseInt(price)).encodeABI();
      var power = await config.web3.eth.getPower(config.controller)
      power = config.web3.utils.fromWei(power, 'gwei')
      console.log("sendSign:",sendSign)
      console.log("power:",power);
      if ( power >  8905078  && currentFeeded <3 && sendSign<0) {
        sendSign=1;
        priceArr=[]
        await sendFun(uploadPrice)
      }else{
        console.log("waiting completed....")
      }
    }
  }
}
async function sendFun(obj){
  try {
      console.log("obj:",obj)
      let nonce = await config.web3.eth.getTransactionCount(config.controller)
      console.log("nonce===",nonce)
      var txObject = await config.web3.eth.accounts.signTransaction({
          to: config.priceFeeder,
          data: obj,
          gas: 200000,
          nonce: nonce++,
      }, config.privatekey)
    //  await onSuccess();
      config.web3.eth.sendSignedTransaction(txObject.rawTransaction)
        .once('transactionHash', onSended())
        .once('confirmation', onSuccess())
        .once('error', onError())
  } catch (e) {
      console.log("first err:",e);
  }
}
function onSuccess(){
 var dosucess =async (confNumber, receipt) => {
   let hash = receipt.transactionHash;
   console.log("success hash:",hash)
   sendSign=-1;
 }
 return dosucess

}

function onSended(){
 return (hash) => {
   sendSign=-1;
   console.log("pendding hash:",hash)
 }
}
function onError(){
 var doerror = (error) => {
   sendSign=-1;
   console.log("error:",error)
 }
 return doerror
}


function sleep(time = 0) {
     return new Promise((resolve, reject) => {
       setTimeout(() => {
         resolve();
       }, time);
     })
   }

setInterval(startFun,20000)
setInterval(makePriceArr,4000)
//startFun()
