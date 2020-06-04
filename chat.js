const activeUsers = {};
let currentTheme = null;

function handleConnect(clientSocket) {
    clientSocket.on('login', (message) => {
        if (activeUsers[clientSocket.id] !== undefined) return ;

        activeUsers[clientSocket.id] = {
            name: message.name + '#' + makeid(6),
        }
        if (currentTheme !== null) clientSocket.emit('theme', currentTheme);
        clientSocket.broadcast.emit('message', {sender: 'server', message: `User ${activeUsers[clientSocket.id].name} has entered the chat.`});
    });

    clientSocket.on('message', (message) => {
        clientSocket.broadcast.emit('message', {sender: activeUsers[clientSocket.id].name, message});
    });

    clientSocket.on('username', (newUser) => {
        if (newUser === null || newUser === undefined) return ;
       
        const newUserId = newUser + '#' + makeid(6);
        clientSocket.broadcast.emit('message', {sender: 'server', message: `User ${activeUsers[clientSocket.id].name} changed his name to ${newUserId}`});

        activeUsers[clientSocket.id].name = newUserId;
    });

    clientSocket.on('theme', (newTheme) => {
        if (newTheme === null || newTheme === undefined) return ;
        currentTheme = newTheme;
        clientSocket.broadcast.emit('theme', newTheme);
        clientSocket.broadcast.emit('message', {sender: 'server', message: `User ${activeUsers[clientSocket.id].name} changed colors in chat to ${newTheme}`});
    });

    clientSocket.on('users', () => {
        const users = Object.keys(activeUsers).map(key => activeUsers[key].name);
        clientSocket.emit('users', {users});
    });

    clientSocket.on('disconnect', () => handleDisconnect(clientSocket));
}

function handleDisconnect(clientSocket) {
    clientSocket.broadcast.emit('message', {sender: 'server', message: `User ${activeUsers[clientSocket.id].name} has left the chat.`});
    delete activeUsers[clientSocket.id];
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 } 

module.exports = handleConnect;