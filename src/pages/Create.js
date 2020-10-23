import React from "react";

import "../styles/css/pages.css";

const Create = () => {
    return (
        <>
            <h2>PreGov</h2>
            <p id='title-helper'>
                Know the impact of your governance decisions before you make
                them
            </p>
            <div className='create'>
                <div>
                    <label>Omen Market URL with stable coin</label>
                    <input type='text' id='omen-market-stable-coin' />
                </div>
                <div>
                    <label>Omen Market URL with protocol token</label>
                    <input type='text' id='omne-market-protocol-token' />
                </div>
                <div>
                    <label>URL to governance event</label>
                    <input type='text' id='governance-event' />
                </div>
                <button>Create</button>
            </div>
        </>
    );
};

export default Create;
