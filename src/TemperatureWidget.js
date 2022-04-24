import React, { useEffect, useState, useLayoutEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'mqtt';
import { v4 as uuidv4 } from 'uuid';
import { Chart } from "react-google-charts";
// http://ubuntu:1880/sensor?from=1650725203051
const TemperatureWidget = (props) => {
    const [client, setClient] = useState(null);
    const [connectionStatus, setConnectStatus] = useState(null);
    const [payload, setPayload] = useState({});

    let options = {
        'protocol': 'mqtt',
        'clientId': uuidv4(),
    };

    const chart_data = [
        ["Date & Time", "Temperature", "Humidity"],
        ["2004", 12, 45],
        ["2005", 15, 54],
        ["2006", 24, 34],
        ["2007", 17, 46],
      ];
      
    const chart_options  = {
        hAxis: {
          title: "Date & Time",
        },
        vAxis: {
          title: "Temperature & humidity",
        },
        series: {
          1: { curveType: "function" },
        },
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
            client.subscribe(["sensor2"]);
        }
    }, [client]);

    useLayoutEffect(() => {
        setConnectStatus('Connecting ...');
        setClient(connect("mqtt://sensor2:9090", options));
    }, []);

    return (
        <div>
            <p>Status: {connectionStatus}</p>
            <Chart
                chartType="LineChart"
                data={chart_data}
                options={chart_options}
                width="100%"
                height="400px"
            />
        </div>
    );
}

export default TemperatureWidget;