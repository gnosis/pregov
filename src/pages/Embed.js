import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Query } from 'react-apollo'
import { gql } from 'apollo-boost'
import { withRouter } from 'react-router-dom';

import getUniswapTokenPairs from '../helpers/getUniswapV2';
import getERC20Info from '../helpers/getERC20';
import Error from '../components/Error.js';
import "../styles/scss/embed.scss";
import Web3 from 'web3';

const web3Endpoint = process.env.REACT_APP_DEFAULT_NODE_ETH;
const web3 = new Web3(new Web3.providers.HttpProvider(web3Endpoint));

const MAX_QUERY_AMOUNT = 20;

const OMEN_SUBGRAPH_QUERY = gql`
  query question($id: String!) {
      question(id: $id) {
    id
    title
    conditions {
      id
      fixedProductMarketMakers {
        id
        collateralToken
        outcomeTokenAmounts
        outcomeTokenMarginalPrices
      }
    }
  }
}`

const Embed = () => {
    const { id, baseToken, quoteCurrencyToken } = useParams();
    const [baseTokenInfo, setBaseTokenInfo] = useState(null);
    const [quoteCurrencyTokenInfo, setQuoteCurrencyTokenInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [priceYes, setPriceYes] = useState(0);
    const [priceNo, setPriceNo] = useState(0);
    const [url, setUrl] = useState('')

    const getLogoUrl = (checksumAddress) => {
      return `https://gnosis-safe-token-logos.s3.amazonaws.com/${checksumAddress}.png`;
    }

    const predictPriceImpact = () => {
      // (predicted price of yes-predicted price of no)/predicted price of no
      if(!priceNo || !priceYes) return ''

      const result = (priceYes - priceNo) / priceNo;

      return (result * 100).toFixed(2);
    }

    const getTokenPrice = (outcomeIndex) => {
      if ( baseTokenInfo.fixedProductMarketMakers !== null ) {
        return (
          quoteCurrencyTokenInfo.price *
          (
            parseFloat(
              baseTokenInfo.fixedProductMarketMakers.outcomeTokenMarginalPrices[outcomeIndex]
            ) /
            parseFloat(
              quoteCurrencyTokenInfo.fixedProductMarketMakers.outcomeTokenMarginalPrices[outcomeIndex]
            )
          )
        );
      }
      return 0.0;
    }

    const predictPrice = (outcomeIndex) => {
      if(outcomeIndex === 0 && !!priceYes) {
        return priceYes.toFixed(2);
      }
      if(outcomeIndex === 1 && !!priceNo) {
        return priceNo.toFixed(2);
      }

      const tokenPrice = getTokenPrice(outcomeIndex);
      if (outcomeIndex === 0) {
        setPriceYes(tokenPrice);
      } else {
        setPriceNo(tokenPrice);
      }
      return tokenPrice.toFixed(2);
    }

    const setMarketMakers = (fixedProductMarketMakers) => {
      if (fixedProductMarketMakers.length > 0) {
        baseTokenInfo.fixedProductMarketMakers = fixedProductMarketMakers.find(
          market => market.collateralToken === baseTokenInfo.address
        );
        quoteCurrencyTokenInfo.fixedProductMarketMakers = fixedProductMarketMakers.find(
          market => market.collateralToken === quoteCurrencyTokenInfo.address
        );
      }
    }

    useEffect(() => {
        const fetchTokenInfo = async () => {
          if (baseTokenInfo === null) {
            const tokenPairQuery = await getUniswapTokenPairs(quoteCurrencyToken, baseToken);
            const baseTokenContract = await getERC20Info(web3, baseToken);
            const baseTokenInfo = {
              address: baseToken.toLowerCase(),
              checksumAddress: web3.utils.toChecksumAddress(baseToken),
              name: baseTokenContract.name, 
              symbol: baseTokenContract.symbol,
              fixedProductMarketMakers: null
            };
            const quoteCurrencyTokenContract = await getERC20Info(web3, quoteCurrencyToken);
            const quoteCurrencyTokenInfo = {
              address: quoteCurrencyToken.toLowerCase(),
              name: quoteCurrencyTokenContract.name,
              symbol: quoteCurrencyTokenContract.symbol,
              fixedProductMarketMakers: null,
              price: 0.0
            };

            if (tokenPairQuery.data.pairsTokens.length > 0) {
              quoteCurrencyTokenInfo.price = tokenPairQuery.data.pairsTokens[0];
            } else if (
              tokenPairQuery.data.pairsTokens0.length > 0 &&
              tokenPairQuery.data.pairsTokens1.length > 0
            ) {
              quoteCurrencyTokenInfo.price = 
                parseFloat(tokenPairQuery.data.pairsTokens0[0].token0Price) /
                parseFloat(tokenPairQuery.data.pairsTokens1[0].token0Price);
            }
            setBaseTokenInfo(baseTokenInfo);
            setQuoteCurrencyTokenInfo(quoteCurrencyTokenInfo);
            setLoading(false);
          }
        };
        if (baseToken && quoteCurrencyToken) {
          fetchTokenInfo();
        }
        const fullPath = window.location.search.substring(1);
        const qArray = fullPath.split('=');
        if (qArray[0] === 'space') {
          setUrl(qArray[1])
        }
    }, [id, baseToken, quoteCurrencyToken, baseTokenInfo, quoteCurrencyTokenInfo]);

    return !loading ? (
      <div id="app" className={`details ${url} width-full height-full`}>
        <Query
          query={OMEN_SUBGRAPH_QUERY}
          variables={{
            id,
            where: {},
            orderBy: 'timeCreated',
            first: MAX_QUERY_AMOUNT,
          }}
        >
          {({ data, error, loading }) => {
            return loading ? (
              <p>Loading...</p>
            ) : error ? (
              <Error error={error} />
            ) : (
              <>
                { setMarketMakers(data.question.conditions[0].fixedProductMarketMakers) }
                <h4 className="px-4 pt-3 border-bottom d-block bg-gray-dark rounded-top-0 rounded-md-top-2 width-full" style={{paddingBottom: '12px'}}>
                  Gnosis Impact
                </h4>
                <div className="p-4 width-full block-bg">
                  <div>
                    <div className="text-white mb-1">
                      <span className="mr-1">Predicted Price Impact:</span>
                      <span className="float-right">
                        <img
                          className="d-inline-block v-align-middle line-height-0 circle border"
                          alt={baseTokenInfo.name}
                          src={getLogoUrl(baseTokenInfo.checksumAddress)}
                          width="22"
                          height="22"
                        />&nbsp;
                        {predictPriceImpact()} %
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1">
                      <b>{baseTokenInfo ? baseTokenInfo.name : ''} price if "Yes":</b>
                      <span className="float-right text-white">
                        1&nbsp;
                        {
                          baseTokenInfo.symbol
                        } =&nbsp;
                        {
                          predictPrice(0)
                        }&nbsp;
                        {
                          quoteCurrencyTokenInfo.symbol
                        }
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1">
                      <b>{baseTokenInfo ? baseTokenInfo.name : ''} price if "No":</b>
                      <span className="float-right text-white">
                        1&nbsp;
                        {
                          baseTokenInfo.symbol
                        } =&nbsp;
                        {
                          predictPrice(1)
                        }&nbsp;
                        {
                          quoteCurrencyTokenInfo.symbol
                        }
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="mb-1">
                      <b>{baseTokenInfo ? baseTokenInfo.name : ''} Market</b>
                      <span className="float-right text-white">
                        <a target="_blank" rel="noopener noreferrer" href={`https://omen.eth.link/#/${baseTokenInfo.fixedProductMarketMakers.id}`}>
                          <i className='fas fa-external-link-alt'></i>
                        </a>
                      </span>
                    </div>
                    <div className="mb-1">
                      <b>{baseTokenInfo ? quoteCurrencyTokenInfo.name : ''} Market</b>
                      <span className="float-right text-white">
                        <a target="_blank" rel="noopener noreferrer" href={`https://omen.eth.link/#/${quoteCurrencyTokenInfo.fixedProductMarketMakers.id}`}>
                          <i className='fas fa-external-link-alt'></i>
                        </a>
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}}
        </Query>
      </div>
    ) : (
      <p>Loading...</p>
    );
};

export default withRouter(Embed);