const fetch = require('node-fetch');

const OMEN_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/protofire/omen';

/**
 * Get FixedProductMarketMakers
 */
const getFixedProductMarketMakers = (baseTokenMarket, quoteTokenMarket) => {

  const jsonQuery = { query: `{
    baseTokenMarket: fixedProductMarketMakers(where: {
    id: "${baseTokenMarket}"
  }) {
    collateralToken
    outcomeTokenMarginalPrices
  }
  quoteTokenMarket: fixedProductMarketMakers(where: {
    id: "${quoteTokenMarket}"
  }) {
    collateralToken
    outcomeTokenMarginalPrices
  }}` };
  const promise = fetch(OMEN_SUBGRAPH_URL, {
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

export default getFixedProductMarketMakers;