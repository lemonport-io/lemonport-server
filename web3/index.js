const Web3 = require('web3');
const { HTTP_PROVIDER } = require('../config/index');

var web3 = new Web3(new Web3.providers.HttpProvider(HTTP_PROVIDER));

const web3SetProvider = provider => {
  let providerObj = null;
  if (provider.match(/(https?:\/\/)(\w+.)+/g)) {
    providerObj = new Web3.providers.HttpProvider(provider);
  } else if (provider.match(/(wss?:\/\/)(\w+.)+/g)) {
    providerObj = new Web3.providers.WebsocketProvider(provider);
  }
  if (!providerObj) {
    throw new Error(
      'function web3SetProvider requires provider to match a valid HTTP/HTTPS or WS/WSS address'
    );
  }
  return web3.setProvider(providerObj);
};

module.exports = {
  web3,
  web3SetProvider
};
