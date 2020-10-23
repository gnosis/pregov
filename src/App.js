import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./pages/Home";
import Create from "./pages/Create";
import Details from "./pages/Details";
import Embed from "./pages/Embed";
import { ApolloProvider, Query } from 'react-apollo'
import { gql } from 'apollo-boost'

import "./App.css";



const OMEN_QUERY = gql`
{
  question(id: "0x44c68bc0038635feb4bf7776c24f0c71748fa4bc3a73d3f94115959469da83a1") {
    id
    title
    conditions {
      id
      fixedProductMarketMakers {
        id
        collateralToken
      }
    }
  }
}
`
// const ARGENT_QUERY = gql`
//   query contractBasedAccounts(
//     $where: ContractBasedAccount_filter!
//     $orderBy: ContractBasedAccount_orderBy!
//     $first: Int
//   ) {
//     contractBasedAccounts(
//       first: $first
//       where: $where
//       orderBy: $orderBy
//       orderDirection: desc
//     ) {
//       id
//       timeCreated
//     }
//   }
// `


function App() {



    return (
        <div className='main'>
            <Router>
                <Switch>
                    <Route path='/' exact>
                        <Home />
                    </Route>
                    <Route path='/create' exact>
                        <Create />
                    </Route>
                    <Route path='/create/:id' exact>
                        <Details />
                    </Route>
                    <Route path='/embed/:id/:token1/:token2' exact>
                        <Embed />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
