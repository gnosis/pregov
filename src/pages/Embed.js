import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Query } from 'react-apollo'
import { gql } from 'apollo-boost'
import { withRouter } from "react-router-dom";

import Error from '../components/Error.js'
import "../styles/css/embed.css";

const MAX_QUERY_AMOUNT = 20

const GNOSIS_SAFE_QUERY = gql`
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


// :id- 0x44c68bc0038635feb4bf7776c24f0c71748fa4bc3a73d3f94115959469da83a1
// :token1 - 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 USDC
// :token2 - 0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2 WETH

// /embed/QmSx1zCRrrcrSUAT1cDq5ZWpwm87jvMudt7cUfoG4hUQhi/0x7Fb7e28B8bbbA6A0C28c8Ac6a522C2FEFe44ee96/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48

// http://localhost:3000/embed/0x44c68bc0038635feb4bf7776c24f0c71748fa4bc3a73d3f94115959469da83a1/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2/

const Embed = () => {
    const { id, token1, token2 } = useParams();
    const [instanceInfo, setInfo] = useState([]);
    const [orderBy, setOrderBy] = useState('timeCreated');
    const [query, setQuery] = useState(GNOSIS_SAFE_QUERY);
    const [token1Info, setToken1Info] = useState(null);
    const [token2Info, setToken2Info] = useState(null);
    const [loading, setLoading] = useState(true);
    const [priceYes, setPriceYes] = useState(0);
    const [priceNo, setPriceNo] = useState(0);

    const fetchInstanceInfo = async () => {
        let results = []
        console.log('question id', id, 'token1', token1, 'token2',token2);
        // let results = await fetch(`http://localhost:8000/instances?id=${id}`);
        // results = await results.json();
        setInfo(results);
        if(token1 && token2) fetchTokenInfo()
    };

    const fetchTokenInfo = async () => {
        let results = []
        console.log('question id', id, 'token1', token1, 'token2',token2);
        // https://api.ethplorer.io/getTokenInfo/0xb5a5f22694352c15b00323844ad545abb2b11028?apiKey=freekey
        // let results = await fetch(`http://localhost:8000/token?address=${token1}`);
        let result1 = await fetch(`https://api.ethplorer.io/getTokenInfo/${token1}?apiKey=freekey`, {mode: 'cors'})
        result1 = await result1.json()
        setToken1Info(result1)
        let result2 = await fetch(`https://api.ethplorer.io/getTokenInfo/${token2}?apiKey=freekey`, {mode: 'cors'})
        result2 = await result2.json()
        setToken2Info(result2)
        console.log(result1,result2,token1Info,token2Info);
        setLoading(false)
    };

    const predictPriceImpact = () => {
      console.log('priceYes no', priceYes, priceNo);
      // (predicted price of yes-predicted price of no)/predicted price of no
      if(!priceNo || !priceYes) return ''

      const result = (priceYes-priceNo)/priceNo

      return result.toFixed(2)
    }

    const predictPrice = ( index, outcomeT1, outcomeT2 ) => {
      console.log('outcomeT1', outcomeT1, outcomeT2);
      if(index==0 && !!priceYes ){
        return priceYes.toFixed(2)
      }

      if(index==1 && !!priceNo){
        return priceNo.toFixed(2)
      }

      const govTokenPrice = token1Info.price.rate;
      const result = govTokenPrice * outcomeT1[index]/outcomeT2[index]
      console.log('result if '+(index==0?'yes':'no'),result);
      // return 'price'
      if(index==1) setPriceNo(result)
      else setPriceYes(result)

      return result.toFixed(2);
    }

    useEffect(() => {
        fetchInstanceInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return !loading ? (
        <div className='details'>
          
            <Query
               query={query}
               variables={{
                 id,
                 where: {},
                 orderBy: orderBy,
                 first: MAX_QUERY_AMOUNT,
               }}
             >
               {({ data, error, loading }) => {
                 console.log('data query omen', data, error, loading);
                 return loading ? (
                   <p>Loading..</p>
                 ) : error ? (
                   <Error error={error} />
                 ) : (
                   <>
                      {/* <p id="event-title">
                          {`Event: ${data.question.title}`}
                      </p> */}
                    <div className='details-subcontainer'>
                      <div id="title-div">
                          <p id="title">Predicted Impact</p>
                      </div>
                      <div>
                          <p>Predicted Price Impact:</p>
                          <span>
                              {predictPriceImpact()*100}%
                          </span>
                      </div>
                      <div>
                        <p>Project Token price if "Yes":</p>
                        <span>${predictPrice(0,data.question.conditions[0].fixedProductMarketMakers[0].outcomeTokenMarginalPrices, data.question.conditions[0].fixedProductMarketMakers[1].outcomeTokenMarginalPrices)}</span>
                      </div>
                      <div>
                          <p>Project Token price if "No":</p>
                          <span>${predictPrice(1,data.question.conditions[0].fixedProductMarketMakers[0].outcomeTokenMarginalPrices, data.question.conditions[0].fixedProductMarketMakers[1].outcomeTokenMarginalPrices)}</span>
                      </div>
                        <div id="price-values">
                          <p>Markets</p>
                          <div>
                            <p>
                                {token1Info ? token1Info.name : ''}
                                <a href={`https://omen.eth.link/#/${data.question.conditions[0].fixedProductMarketMakers[0].id}`}>
                                    <i className='fas fa-external-link-alt'></i>
                                </a>
                            </p>
                            <p>
                                {token1Info ? token2Info.name : ''}
                                <a href={`https://omen.eth.link/#/${data.question.conditions[0].fixedProductMarketMakers[1].id}`}>
                                    <i className='fas fa-external-link-alt'></i>
                                </a>
                            </p>   
                          </div>
                        </div>                  
                      </div>
                    </>
                )}}
            </Query>
        </div>
    ) : (
        <p>Loading..</p>
    );
};

export default withRouter(Embed);


//YES Predicted Price of Gov Token if YES = (Price of Gov token in USDC*Odds of Gov token if YES)/(Odds of collateral if YES)

// No Predicted Price of Gov Token if NO = (Price of Gov token in USDC*Odds of Gov token if NO)/(Odds of collateral if NO)

// "outcomeTokenAmounts": [
//                 "2257103847323363803",
//                 "9745276020899330163"
//               ],
//               "outcomeTokenMarginalPrices": [
//                 "0.8119453081718205489934860868964744",
//                 "0.1880546918281794510065139131035256"
//               ],
