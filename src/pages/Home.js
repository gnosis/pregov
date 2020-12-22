import React from 'react';

import "../styles/css/pages.css";

const Home = () => {

    return (
        <>
            <h2>Gnosis Impact</h2>
            <p id='title-helper'>
                Know the impact of your governance decisions before you make them
            </p>
            <div className='create'>
            <form id="main-home" action='/embed' method='GET'>
                <fieldset>
                    <legend>Omen Market URL with base token</legend>
                    <input type='text' id='omen-market-base-token' name='quote-token-market' autoFocus='true' />
                </fieldset>
                <fieldset>
                    <legend>Omen Market URL with quote token</legend>
                    <input type='text' id='omne-market-quote-token' name='quote-token-market' />
                </fieldset>
                <fieldset>
                    <button>View</button>
                </fieldset>
            </form>
            </div>   
        </>
    );
};

export default Home;
