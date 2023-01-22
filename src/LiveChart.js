import React, { useEffect, useState, useLayoutEffect, useRef, Fragment } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import "./LiveChart.css"

const LiveChart = ({sensorId, title}) => {

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [sensorData, setSensorData] = useState([]);
    const [currentTemp, setCurrentTemp] = useState(0);
    const chartRef = useRef(null);
    const [timer, setTimer] = useState(new Date().getTime())

    const parseSensorData = (data) => {
        let chart_data = [];
        for (let probe of data) {
            chart_data.push({ date: new Date(probe.timestamp).getTime(), value: parseFloat(probe.temperature) });
        }
        chart_data[data.length - 1].bullet = true;
        return chart_data;
    }

    useLayoutEffect(() => {
        if (isLoaded) {
            let root = am5.Root.new("chartdiv"+ sensorId);

            root.setThemes([
                am5themes_Animated.new(root)
            ]);

            root.current = root;

            var chart = root.container.children.push(am5xy.XYChart.new(root, {
                panX: true,
                panY: true,
                wheelX: "panX",
                wheelY: "zoomX",
                pinchZoomX: true,
            }));

            var easing = am5.ease.linear;
            chartRef.current = chart;

            let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
            cursor.lineY.set("visible", false);

            var xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
                maxDeviation: 0,
                groupData: false,
                baseInterval: {
                    timeUnit: "minute",
                    count: 10
                },
                renderer: am5xy.AxisRendererX.new(root, {}),
                tooltip: am5.Tooltip.new(root, {})
            }));

            var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
                maxDeviation: 0,
                logarithmic: true,
                renderer: am5xy.AxisRendererY.new(root, {})
            }));

            var series = chart.series.push(am5xy.LineSeries.new(root, {
                name: "Series 1",
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "value",
                valueXField: "date",
                tooltip: am5.Tooltip.new(root, {
                    labelText: "{valueY}°C"
                })
            }));
            series.strokes.template.setAll({
                strokeWidth: 2,
              });

            series.bullets.push(function (root, series, dataItem) {
                // only create sprite if bullet == true in data context
                if (dataItem.dataContext.bullet) {
                    let container = am5.Container.new(root, {});
                    container.children.push(am5.Circle.new(root, {
                        radius: 5,
                        fill: am5.color(0xff0000)
                    }));
                    let circle1 = container.children.push(am5.Circle.new(root, {
                        radius: 5,
                        fill: am5.color(0xff0000)
                    }));

                    circle1.animate({
                        key: "radius",
                        to: 20,
                        duration: 1000,
                        easing: am5.ease.out(am5.ease.cubic),
                        loops: Infinity
                    });
                    circle1.animate({
                        key: "opacity",
                        to: 0,
                        from: 1,
                        duration: 1000,
                        easing: am5.ease.out(am5.ease.cubic),
                        loops: Infinity
                    });
 
                    return am5.Bullet.new(root, {
                        sprite: container
                    })
                }
            });

            series.data.setAll(sensorData);


            return () => {
                root.dispose();
            };
        }

    }, [isLoaded, sensorData]);

    useEffect(() => {
        fetch("http://temp:1880/sensor?id="+ sensorId)
            .then(res => res.json())
            .then(
                (data) => {
                    setIsLoaded(true);
                    setSensorData(parseSensorData(data));
                    setCurrentTemp(data[data.length-1].temperature);
                    console.info("Fetching new data ... DONE");
                },
                (error) => {
                    setIsLoaded(false);
                    setError(error);
                    console.info("Fetching new data ... ERROR");
                }
            )
        setTimeout(() => {
            setTimer(new Date().getTime());
            console.info("Fetching new data ...");
        }, 300000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timer]);

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
                <Fragment>
                        <div className='title'>{title}<br/>{currentTemp}°C</div>
                        <div id={"chartdiv"+sensorId} style={{ width: "100%", height: "500px" }}></div></Fragment>
        );
    }
}

export default LiveChart;