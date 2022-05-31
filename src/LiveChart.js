import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

const LiveChart = (props) => {

    const [error, setError] = useState(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [sensorData, setSensorData] = useState([]);
    const chartRef = useRef(null);

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
            let root = am5.Root.new("chartdiv");

            root.setThemes([
                am5themes_Animated.new(root)
            ]);

            root.current = root;

            var chart = root.container.children.push(am5xy.XYChart.new(root, {
                focusable: true,
                panX: true,
                panY: true,
                wheelX: "panX",
                wheelY: "zoomX",
                pinchZoomX: true,
                layout: root.verticalLayout,
                maxTooltipDistance: 0
            }));

            var easing = am5.ease.linear;
            chartRef.current = chart;

            // Create axes
            // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
            var xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
                maxDeviation: 0.1,
                groupData: false,
                baseInterval: {
                    timeUnit: "minute",
                    count: 1
                },
                renderer: am5xy.AxisRendererX.new(root, {
                    minGridDistance: 50
                })
            }));

            var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
                maxDeviation: 0.1,
                extraTooltipPrecision: 1,
                renderer: am5xy.AxisRendererY.new(root, {})
            }));

            var series = chart.series.push(am5xy.LineSeries.new(root, {
                name: "Series 1",
                xAxis: xAxis,
                yAxis: yAxis,
                valueYField: "value",
                valueXField: "date",
                tooltip: am5.Tooltip.new(root, {
                    pointerOrientation: "horizontal",
                    labelText: "{valueY}°C"
                })
            }));

            series.data.setAll(sensorData);

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
                        locationX: undefined,
                        sprite: container
                    })
                }
            })


            // Add cursor
            // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
            let cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
                xAxis: xAxis
            }));
            cursor.lineY.set("visible", false);

            xAxis.set("tooltip", am5.Tooltip.new(root, {
                themeTags: ["axis"]
            }));

            yAxis.set("tooltip", am5.Tooltip.new(root, {
                themeTags: ["axis"]
            }));

            series.appear(1000, 100);
            chart.appear(1000, 100);
            return () => {
                root.dispose();
            };
        }

    }, [isLoaded, sensorData]);

    useEffect(() => {
        fetch("http://temp:1880/sensor")
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (error) {
        return <div>Error: {error.message}</div>;
    } else if (!isLoaded) {
        return <div>Loading...</div>;
    } else {
        return (
            <div id="chartdiv" style={{ width: "100%", height: "500px" }}></div>
        );
    }
}

export default LiveChart;