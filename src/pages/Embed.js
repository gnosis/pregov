import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'react-apollo'
import { gql } from 'apollo-boost'
import { withRouter } from 'react-router-dom';

import getUniswapTokenPairs from '../helpers/getUniswapV2';
import getERC20Info from '../helpers/getERC20';
import Error from '../components/Error.js';
import "../styles/scss/embed.scss";
import Web3 from 'web3';

const web3Endpoint = process.env.REACT_APP_DEFAULT_NODE_ETH;
const web3 = new Web3(new Web3.providers.HttpProvider(web3Endpoint));

const OMEN_SUBGRAPH_QUERY = gql`
  query fixedProductMarketMaker($baseTokenMarket: String!, $quoteTokenMarket: String!) {
    baseTokenMarket: fixedProductMarketMaker(id: $baseTokenMarket) {
      collateralToken
      outcomeTokenMarginalPrices
    }
    quoteTokenMarket: fixedProductMarketMaker(id: $quoteTokenMarket) {
      collateralToken
      outcomeTokenMarginalPrices
    }
  }`;

const Embed = () => {
    const { baseTokenMarket, quoteTokenMarket } = useParams();
    const [loading, setLoading] = useState(true);
    const [fixedProductMarketMakers, setFixedProductMarketMakers] = useState(null);
    const [baseTokenInfo, setBaseTokenInfo] = useState(null);
    const [quoteTokenInfo, setQuoteTokenInfo] = useState(null);
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
      if ( baseTokenInfo && baseTokenInfo.fixedProductMarketMakers !== null ) {
        return (
          quoteTokenInfo.price *
          (
            parseFloat(
              baseTokenInfo.outcomeTokenMarginalPrices[outcomeIndex]
            ) /
            parseFloat(
              quoteTokenInfo.outcomeTokenMarginalPrices[outcomeIndex]
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

    const getTokenPairPrice = async (quoteTokenAddress, baseTokenAddress) => {
      let result = 0.0;
      const tokenPairQuery = await getUniswapTokenPairs(quoteTokenAddress, baseTokenAddress);
      if (tokenPairQuery.data.pairsTokens.length > 0) {
        result = tokenPairQuery.data.pairsTokens[0];
      } else if (
        tokenPairQuery.data.pairsTokens0.length > 0 &&
        tokenPairQuery.data.pairsTokens1.length > 0
      ) {
        result =
          parseFloat(tokenPairQuery.data.pairsTokens0[0].token0Price) /
          parseFloat(tokenPairQuery.data.pairsTokens1[0].token0Price);
      }
      
      return result;
    }

    useEffect(() => {
      const fetchTokenInfo = async () => {
        if (fixedProductMarketMakers.baseTokenMarket) {
          const baseTokenAddress = fixedProductMarketMakers.baseTokenMarket.collateralToken.toLowerCase();
          const baseTokenContract = await getERC20Info(web3, baseTokenAddress);
          const baseTokenInfo = {
            address: baseTokenAddress,
            checksumAddress: web3.utils.toChecksumAddress(baseTokenAddress),
            name: baseTokenContract.name, 
            symbol: baseTokenContract.symbol,
            fixedProductMarketMakers: baseTokenMarket,
            outcomeTokenMarginalPrices: fixedProductMarketMakers.baseTokenMarket.outcomeTokenMarginalPrices
          };
          setBaseTokenInfo(baseTokenInfo);
  
          if (fixedProductMarketMakers.quoteTokenMarket) {
            const quoteTokenAddress = fixedProductMarketMakers.quoteTokenMarket.collateralToken.toLowerCase();
            const quoteTokenContract = await getERC20Info(web3, quoteTokenAddress);
            const quoteTokenInfo = {
              address: quoteTokenAddress,
              checksumAddress: web3.utils.toChecksumAddress(quoteTokenAddress),
              name: quoteTokenContract.name, 
              symbol: quoteTokenContract.symbol,
              fixedProductMarketMakers: quoteTokenMarket,
              outcomeTokenMarginalPrices: fixedProductMarketMakers.quoteTokenMarket.outcomeTokenMarginalPrices,
              price: await getTokenPairPrice(quoteTokenAddress, baseTokenAddress),
            }; 
            setQuoteTokenInfo(quoteTokenInfo);
          }
        }
        setLoading(false);
      }
      if (fixedProductMarketMakers) {
        fetchTokenInfo();
      }
      const fullPath = window.location.search.substring(1);
      const qArray = fullPath.split('=');
      if (qArray[0] === 'space') {
        setUrl(qArray[1])
      }  
    }, [fixedProductMarketMakers, baseTokenInfo, quoteTokenInfo]);

    const { loadingQuery, error, data } = useQuery(OMEN_SUBGRAPH_QUERY, {
      variables: {
        baseTokenMarket,
        quoteTokenMarket
    }});

    if (loadingQuery) return 'Loading...';
    if (error) return <Error error={error} />;
    setFixedProductMarketMakers(data);

    return !loading && (
      <div id="app" className={`details ${url} width-full height-full`}>
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
                  alt={baseTokenInfo ? baseTokenInfo.name : ''}
                  src={getLogoUrl(baseTokenInfo ? baseTokenInfo.checksumAddress : '')}
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
                  baseTokenInfo ? baseTokenInfo.symbol : ''
                } =&nbsp;
                {
                  predictPrice(0)
                }&nbsp;
                {
                  quoteTokenInfo ? quoteTokenInfo.symbol : ''
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
                  baseTokenInfo ? baseTokenInfo.symbol : ''
                } =&nbsp;
                {
                  predictPrice(1)
                }&nbsp;
                {
                  quoteTokenInfo ? quoteTokenInfo.symbol : ''
                }
              </span>
            </div>
          </div>
          <div>
            <div className="mb-1">
              <b>{baseTokenInfo ? baseTokenInfo.name : ''} Market</b>
              <span className="float-right text-white">
                <a target="_blank" rel="noopener noreferrer" href={baseTokenInfo ? `https://omen.eth.link/#/${baseTokenInfo.fixedProductMarketMakers.id}` : ''}>
                  <i className='fas fa-external-link-alt'></i>
                </a>
              </span>
            </div>
            <div className="mb-1">
              <b>{baseTokenInfo ? quoteTokenInfo.name : ''} Market</b>
              <span className="float-right text-white">
                <a target="_blank" rel="noopener noreferrer" href={quoteTokenInfo ? `https://omen.eth.link/#/${quoteTokenInfo.fixedProductMarketMakers.id}` : ''}>
                  <i className='fas fa-external-link-alt'></i>
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
}

export default withRouter(Embed);