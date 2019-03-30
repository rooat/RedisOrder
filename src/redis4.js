//@flow
const config = require('../config');
const request = require('request');
const md5 = require('md5');

async function startFun(){
  let currentFeeded = await config.MVPpriceFeeder.methods.currentFeeded().call()
  let last = Number(3)-Number(currentFeeded);
  var power = await config.web3.eth.getPower(config.controller)
  power = config.web3.utils.fromWei(power, 'gwei')
  console.log("last:",last)
  console.log("power:",power);
  if(last==0 && power >  20905078 ){
    let updatePrice = config.MVPpriceFeeder.methods['updatePrice()']().encodeABI();
    await sendFun(updatePrice)
  }else{
    console.log("waiting upload....")
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
   // if(funNum==2){
   //   let updatePrice = config.MVPpriceFeeder.methods['updatePrice()']().encodeABI();
   //   funNum=1;
   //   console.log("funNum:===",funNum)
   //   await sendFun(updatePrice)
   // }
 }
 return dosucess

}

function onSended(){
 return (hash) => {
   console.log("pendding hash:",hash)
 }
}
function onError(){
 var doerror = (error) => {
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

setInterval(startFun,800000)
//startFun()
