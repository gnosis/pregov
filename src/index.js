import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import './helpers/skins';
import App from "./App";
import ApolloClient, { InMemoryCache } from 'apollo-boost'
// import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloProvider } from 'react-apollo';

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/protofire/omen",
  cache: new InMemoryCache()
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root"),
);
