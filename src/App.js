import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./pages/Home";
import Create from "./pages/Create";
import Details from "./pages/Details";
import Embed from "./pages/Embed";

import "./App.css";

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
