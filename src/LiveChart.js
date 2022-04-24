import React, { useEffect, useState } from 'react';
import { Chart } from "react-google-charts";
// http://ubuntu:1880/sensor
const LiveChart = (props) => {

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [sensorData, setSensorData] = useState([]);

    const chart_header = ["Date & Time", "Temperature", "Humidity"];

    const chart_options = {
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

    const parseSensorData = (data) => {
        let chart_data = [];
        chart_data.push(chart_header);
        for(let probe of data){
            chart_data.push([new Date(probe.timestamp), {'v':parseFloat(probe.temperature),'f':parseFloat(probe.temperature)+'°C'}, {'v':parseFloat(probe.humidity),'f':parseFloat(probe.humidity)+'%'}]);
        }
        return chart_data;
    }

    useEffect(() => {
        fetch("http://ubuntu:1880/sensor")
            .then(res => res.json())
            .then(
                (data) => {
                    setIsLoaded(true);
                    setSensorData(parseSensorData(data));
                },
                (error) => {
                    setIsLoaded(false);
                    setError(error);
                }
            )
    },[]);

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <Chart
                chartType="LineChart"
                data={sensorData}
                options={chart_options}
                width="100%"
                height="400px"
            />
        );
    }
}

export default LiveChart;