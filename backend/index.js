import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

let messageCounter = 1;

wss.on('connection', (ws) => {
    console.log('WebSocket client connected');
    
    ws.on('message', (data) => {
        const message = data.toString();
        console.log('Received:', message);
        
        const response = `hi${messageCounter}=${message}`;
        messageCounter++;
        
        ws.send(response);
    });
    
    ws.on('close', () => {
        console.log('WebSocket client disconnected');
    });
});

app.use(cors({ origin: "*" }))

app.get('/stream', (req, res)=>{
    res.setHeader("Content-Type", "text/event-stream")
    res.setHeader("Cache-Control", "no-cache")
    res.setHeader("Connection", "keep-alive")

    let t = 0

    const interval = setInterval(()=>{
        const value = Math.sin(t)
        t += 0.05
        res.write(`data: ${JSON.stringify({ value, ts: Date.now() })}\n\n`);
    }, 5)

    req.on("close", ()=> clearInterval(interval))
})

server.listen(process.env.PORT || 10000, () => console.log("Server running")); 

// export default app;