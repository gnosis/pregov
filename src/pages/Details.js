import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import "../styles/css/pages.css";

const Details = () => {
    const { id } = useParams();
    const [instanceInfo, setInfo] = useState([]);

    const fetchInstanceInfo = async () => {
        let results = await fetch(`http://localhost:8000/instances?id=${id}`);
        results = await results.json();
        setInfo(results);
    };

    useEffect(() => {
        fetchInstanceInfo();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <h2>PreGov</h2>
            <p id='title-helper'>
                Know the impact of your governance decisions before you make
                them
            </p>
            {instanceInfo.length !== 0 ? (
                <div className='details'>
                    <div className='details-subcontainer'>
                        <p>
                            {`Event: ${instanceInfo[0].event_link}`}
                            <a href='https://placeholder.com/'>
                                <i className='fas fa-external-link-alt'></i>
                            </a>
                        </p>
                        <p>
                            Omen Market with Stable Coin
                            <a href='https://placeholder.com/'>
                                <i className='fas fa-external-link-alt'></i>
                            </a>
                        </p>
                        <p>
                            Omen Market with Project Coin
                            <a href='https://placeholder.com/'>
                                <i className='fas fa-external-link-alt'></i>
                            </a>
                        </p>
                        <br></br>
                        <div>
                            <p>Predicted Price Impact:</p>
                            <span>
                                ${instanceInfo[0].predicted_price_impact_dollar}
                            </span>
                        </div>
                        <div>
                            <p>Project Token price if "Yes":</p>
                            <span>${instanceInfo[0].project_token_price_y}</span>
                        </div>
                        <div>
                            <p>Project Token price if "No":</p>
                            <span>${instanceInfo[0].project_token_price_n}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <p>Loading..</p>
            )
        }
    </>
    )
};

export default Details;
