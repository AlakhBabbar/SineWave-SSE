import React, { useEffect, useRef } from "react";
import uPlot from "uplot";
import "uplot/dist/uPlot.min.css";

export default function App() {
  const chartRef = useRef(null);
  const uplotRef = useRef(null);

  const xArr = useRef([]);
  const yArr = useRef([]);

  const POINTS = 300; // visible window size

  useEffect(() => {
    // initial empty buffers
    xArr.current = [];
    yArr.current = [];

    // fill only X (fixed positions)
    for (let i = 0; i < POINTS; i++) {
      xArr.current.push(i);
    }

    const options = {
      width: window.innerWidth - 40,
      height: 300,
      scales: {
        x: { time: false },
        y: { auto: true },
      },
      // cursor: {
      //   show: false, // disable vertical moving line
      // },
      axes: [
        {
          stroke: "#ffffff",
          grid: { stroke: "rgba(255,255,255,0.06)" },
          font: "12px Inter",
          labelFont: "12px Inter",
          values: (u, ticks) => ticks.map((t) => t.toString()),
        },
        {
          stroke: "#ffffff",
          grid: { stroke: "rgba(255,255,255,0.06)" },
          font: "12px Inter",
        },
      ],
      series: [
        {},
        {
          label: "Signal",
          stroke: "#00f5a0", // sine wave line
          width: 2,

          points: {
            show: (u, seriesIdx, idx) =>
              idx === u.data[1].length - 1, // only last point visible
            size: 10,
            stroke: "#00f5a0",
            fill: "#00f5a0",
          },
        },
      ],
    };

    const u = new uPlot(options, [xArr.current, yArr.current], chartRef.current);
    uplotRef.current = u;

    // ---------------------
    // SSE LIVE STREAM
    // ---------------------
    const es = new EventSource("http://localhost:3000/stream" || "https://sine-wave-backend.vercel.app/stream");

    es.onmessage = (e) => {
      const { value } = JSON.parse(e.data);

      // maintain a rolling window
      if (yArr.current.length >= POINTS) {
        yArr.current.shift();
      }
      yArr.current.push(value);

      u.setData([xArr.current, yArr.current]);
    };

    // ---------------------
    // AUTO RESIZE SUPPORT
    // ---------------------
    const resizeHandler = () => {
      u.setSize({
        width: window.innerWidth - 40,
        height: 300,
      });
    };

    window.addEventListener("resize", resizeHandler);

    return () => {
      es.close();
      u.destroy();
      window.removeEventListener("resize", resizeHandler);
    };
  }, []);

  return (
    <div className="p-4 bg-[#0a0f1f] rounded-xl shadow-lg">
      <div ref={chartRef} />
    </div>
  );
}
