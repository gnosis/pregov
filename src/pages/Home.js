import React, { useState } from 'react';

import "../styles/css/pages.css";

const Home = () => {

    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = event => {
        event.preventDefault();
       setSubmitting(true);
    
       setTimeout(() => {
         setSubmitting(false);
       }, 3000)
     }
    
    return (
        <>
            <h2>Gnosis Impact</h2>
            <p id='title-helper'>
                Know the impact of your governance decisions before you make them
            </p>
            <form id="main-home" action='/embed' method='GET'>
            <div className='create'>
                <div>
                    <label>Omen Market URL with base token</label>
                    <input type='text' id='omen-market-base-token' name='quote-token-market' />
                </div>
                <div>
                    <label>Omen Market URL with quote token</label>
                    <input type='text' id='omne-market-quote-token' name='quote-token-market' />
                </div>
                <button>View</button>
            </div>
            </form>
        </>
    );
};

export default Home;
