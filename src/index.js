import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import ApolloClient, { InMemoryCache } from 'apollo-boost'
// import { ApolloProvider } from '@apollo/react-hooks';
import { ApolloProvider } from 'react-apollo';

const client = new ApolloClient({
  uri: "https://api.thegraph.com/subgraphs/name/protofire/omen",
  cache: new InMemoryCache()
});

const requireFile = require.context(
  '@snapshot-labs/snapshot-spaces/skins/',
  true,
  /[\w-]+\.scss$/
);

requireFile.keys().map(file => requireFile(file));

requireFile
  .keys()
  .map(file => file.replace('./', '').replace('.scss', ''));


ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById("root"),
);
