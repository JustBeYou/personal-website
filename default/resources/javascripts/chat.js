window.addEventListener('load', () => {
    const chatButton = document.querySelector('button.chat-button');
    chatButton.addEventListener('click', chatDisplayControl);

    const chatMinimizeButton = document.querySelector('a#chat-minimize');
    chatMinimizeButton.addEventListener('click', chatDisplayControl);

    const chatCloseButton = document.querySelector('a#chat-close');
    chatCloseButton.addEventListener('click', () => {
        chatDisplayControl();
        unloadChat();
    });

    const chatInputBox = document.querySelector('input#chat-message-box');
    const chatSendButton = document.querySelector('button#chat-send-button');
    chatSendButton.addEventListener('click',  () => {
        chatSocket.emit('message', chatInputBox.value);
        drawMessage('You', encodeHTML(chatInputBox.value), '#my-message', 'left');
        chatInputBox.value = '';
    });

    chatInputBox.addEventListener("keyup", (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            chatSendButton.click();
        }
    }); 
});

function chatDisplayControl() {
    if (!chatLoaded) loadChat();
 
    const chatBox = document.querySelector('div.chat-box');
    const chatButton = document.querySelector('button.chat-button');

    if (chatBox.style.display === 'none' || chatBox.style.display === '') {
        chatBox.style.display = 'block';
        chatButton.style.display = 'none';
    } else {
        chatBox.style.display = 'none';
        chatButton.style.display = 'block';
    }
}

let chatSocket;
function loadChat() {
    console.log('chat init');;
    chatSocket = io('/chat');
    chatSocket.emit('login', {name: 'John Doe'});

    chatSocket.on('message', handleMessage);
    chatLoaded = true;
}

function handleMessage(message) {
    const sender = encodeHTML(message.sender);
    const content = encodeHTML(message.message);

    drawMessage(sender, content, '#other-user-message', 'right');
}

function drawMessage(sender, content, messageType, timeAlign) {
    const chatContent = document.querySelector('.chat-content');
    const messageTemplate = document.querySelector(messageType);
    
    const newMessage = messageTemplate.content.cloneNode(true);
    newMessage.querySelector('p').innerHTML = content;

    const currentDate = new Date();
    newMessage.querySelector(`span.time-${timeAlign}`).innerHTML = `${sender} at ${currentDate.getHours()}:${currentDate.getMinutes()}`;

    chatContent.appendChild(newMessage);
    chatContent.scrollTop = chatContent.scrollHeight;
}

function unloadChat() {
    socket.close();
    chatSocket = null;
    chatLoaded = false;
}

function encodeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

let chatLoaded = false;