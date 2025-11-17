import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors({ origin: "*" }))

app.get('/stream', (req, res)=>{
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    let t = 0

    const interval = setInterval(()=>{
        const value = Math.sin(t)
        t += 0.1
        res.write(`data: ${JSON.stringify({ value, ts: Date.now() })}\n\n`);
    }, 5)

    req.on("close", ()=> clearInterval(interval))
})

// app.listen(3000, () => console.log("SSE server running on http://localhost:3000"));

export default app()