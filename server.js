import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
    const httpServer = createServer(handler);

    const io = new Server(httpServer, {
        cors: {
            origin: "*",
        },
    });

    globalThis.io = io;

    io.on("connection", (socket) => {
        socket.on("join-maraud", (maraudId) => {
            socket.join(`maraud:${maraudId}`);
        });

        socket.on("leave-maraud", (maraudId) => {
            socket.leave(`maraud:${maraudId}`);
        });
    });

    httpServer
        .once("error", (error) => {
            console.error(error);
            process.exit(1);
        })
        .listen(port, () => {
            console.log(`> Ready on http://${hostname}:${port}`);
        });
});