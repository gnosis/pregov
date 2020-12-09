const fetch = require('node-fetch');

const UNISWAP_V2_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

/**
 * Get Uniswap token pairs
 */
const getUniswapTokenPairs = (token0, token1) => {

  const jsonQuery = { query: `{pairsTokens: pairs(where: {
    token0: "${token0.toLowerCase()}",
    token1: "${token1.toLowerCase()}",
  }) {
    token0Price
  }
  pairsTokens0: pairs(where: {
    token0: "${token0}",
    token1: "${WETH_ADDRESS}",
  }) {
    token0Price
  }
  pairsTokens1: pairs(where: {
    token0: "${token1}",
    token1: "${WETH_ADDRESS}",
  }) {
    token0Price
  }}` };
  const promise = fetch(UNISWAP_V2_SUBGRAPH_URL, {
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(jsonQuery),
    method: 'POST',
  }).then(res => res.json())
  .catch(error => console.error('Error:', error))
  .then(json => {
    if(json && json.errors) {
      throw new Error(json.errors.map(error => error.message));
    }    
    return json;
  });

  return promise;
}

export default getUniswapTokenPairs;