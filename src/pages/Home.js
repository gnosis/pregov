import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";

import Instance from "../components/Instance";

import "../styles/css/pages.css";

const Home = (props) => {
    const [instances, setInstances] = useState([]);

    const fetchInstances = async () => {
        let results = await fetch("http://localhost:8000/instances");
        results = await results.json();
        setInstances(results);
    };

    useEffect(() => {
        fetchInstances();
    }, []);

    return (
        <>
            <h2>PreGov</h2>
                <p id='title-helper'>
                    Know the impact of your governance decisions before you make
                    them
                </p>
            <div className='home'>
                <button
                    id='create-instance'
                    onClick={() => {
                        props.history.push("/create");
                    }}
                >
                    Create PreGov Instance
                </button>
                <div>
                    <p>Event Link</p>
                    <p>Predicted Price Impact</p>
                    <p>More Info</p>
                </div>
                {instances.map((instance, index) => {
                    return (
                        <Instance
                            key={index}
                            instance_id={instance.id}
                            event_link={instance.event_link}
                            price_impact={instance.predicted_price_impact_percent}
                        />
                    );
                })}
            </div>
        </>
    );
};

export default withRouter(Home);
