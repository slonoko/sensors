import React, { useEffect, useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'mqtt';
import { v4 as uuidv4 } from 'uuid';

const LiveChart = (props) => {
    const [client, setClient] = useState(null);
    const [connectionStatus, setConnectStatus] = useState(null);
    const [payload, setPayload] = useState({});

    let options = {
        'protocol': 'mqtt',
        'clientId': uuidv4(),
    };

    useEffect(() => {
        if (client) {
            client.on('connect', (conn) => {
                setConnectStatus('Connected!');
            });
            client.on('error', (err) => {
                console.error('Connection error: ', err);
                client.end();
            });
            client.on('reconnect', () => {
                setConnectStatus('Reconnecting ...');
            });
            client.on('close', () => {
                setConnectStatus('Closed');
            });
            client.on('disconnect', (packet) => {
                setConnectStatus('Disconnected');
            });
            client.on('message', (topic, message) => {
                setPayload({ topic: topic, message: message.toString() });
            });
            client.subscribe(["rpi3", "rpi4"]);
        }
    }, [client]);

    useLayoutEffect(() => {
        setConnectStatus('Connecting ...');
        setClient(connect("mqtt://sensor:9090", options));
    }, []);

    // mqtt://sensor:1883
    return (
        <div>
        <p>Status: {connectionStatus}</p>
        <p>{payload.message}</p>
        </div>
    );
}

export default LiveChart;