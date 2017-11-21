const WebSocketServer = new require('ws');

// подключенные клиенты
const clients = [];

// WebSocket-сервер на порту 8080
const webSocketServer = new WebSocketServer.Server({port: 8080});
webSocketServer.on('connection', ws => {
    const id = clients.push(ws) - 1;
    console.log(`новое соединение ${id}`);

    ws.on('message', message => {
        console.log(`получено сообщение ${message}`);

        for (let key in clients) {
            clients[key].send(message);
        }
    });

    ws.on('close', () => {
        console.log(`соединение закрыто ${id}`);
        delete clients[id];
    });
});