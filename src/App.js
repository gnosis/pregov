import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import dotenv from 'dotenv-flow';

import Home from "./pages/Home";
import Create from "./pages/Create";
import Details from "./pages/Details";
import Embed from "./pages/Embed";

import "./App.css";

dotenv.config();

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
                    <Route path='/embed/:id/:baseToken/:quoteToken' exact>
                        <Embed />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
