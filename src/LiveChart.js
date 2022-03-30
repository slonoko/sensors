import React, { useEffect, useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, IClientOptions } from 'mqtt';

const LiveChart = (props) => {
    const [client, setClient] = useState(null);
    const [connectionStatus, setConnectStatus] = useState(null);
    const [payload, setPayload] = useState(null);

    let options = {
        'hostname': 'sensor',
        'port': 1883,
        'protocol': 'mqtt',
        'protocolId': 'MQIsdp',
        'protocolVersion': 3,
        'clientId': 'client_1',
        'keepalive': 60,
        'reconnectPeriod': 5000,
        'clean': true,
    };

    useEffect(() => {
        if (client) {
            console.log(client)
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
                setPayload({ topic, message: message });
            });
        }
    }, [client]);

    useLayoutEffect(() => {
        setConnectStatus('Connecting ...');
        setClient(connect("ws://sensor:1880/dht"));
    }, []);

    // mqtt://sensor:1883
    return (
        <p>Status: {connectionStatus}</p>
    );
}

export default LiveChart;