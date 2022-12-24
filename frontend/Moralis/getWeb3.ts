import WalletConnect from "@walletconnect/client";
import Web3 from "web3";
import { AbstractProvider } from "web3-core";
import { JsonRpcPayload, JsonRpcResponse } from "web3-core-helpers";

// eslint-disable-next-line functional/prefer-readonly-type
export async function getWeb3({ connector }: { connector: WalletConnect }) {  
  // @ts-ignore  
  if (connector.connected === false){
      return null;
  }
  const makeJsonRpcResponse = (payload: JsonRpcPayload, result: any, error?: Error): JsonRpcResponse => ({
    id: +payload.id,
    jsonrpc: payload.jsonrpc,
    result,
    error: error ? error.message : undefined,
  });
  const isMetamask = connector._peerMeta.name === "MetaMask" ? true : false;
  const abstractProvider: AbstractProvider = {
    sendAsync: (payload, callback) => {
        connector
        .sendCustomRequest(payload)
        .then((result) => {
          console.log('sendAsync result', result);
          callback(null, makeJsonRpcResponse(payload, result))
        })
        .catch((error) => {
          console.log('sendAsync error', error);
          callback(error, makeJsonRpcResponse(payload, null, error))
        });
    },
    send: (payload, callback) => {
        connector
        .sendCustomRequest(payload)
        .then((result) => callback(null, makeJsonRpcResponse(payload, result)))
        .catch((error) => callback(error, makeJsonRpcResponse(payload, null, error)));
    },
    connected: connector.connected,
    isMetaMask: isMetamask
  };
  const web3 = new Web3(abstractProvider); 
  return web3;
}
