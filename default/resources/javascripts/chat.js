window.addEventListener('load', () => {
    const colorPicker = document.querySelector('#colorpicker');
    colorPicker.addEventListener('change', () => {
        const newTheme = colorPicker.value;
        if (newTheme !== null && newTheme !== theme) {
            chatSocket.emit('theme', newTheme);
            handleThemeChange(newTheme);
        }
    });

    const chatButton = document.querySelector('button.chat-button');
    chatButton.addEventListener('click', chatDisplayControl);

    const chatUsersListButton = document.querySelector('a#chat-users-list');
    chatUsersListButton.addEventListener('click', showUsers);

    const chatSettingsButton = document.querySelector('a#chat-settings');
    chatSettingsButton.addEventListener('click', changeSettings);

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
        drawMessage('You', encodeHTML(chatInputBox.value), 'left', '', '<i class="fas fa-user-tie right"></i>');
        chatInputBox.value = '';
    });

    chatInputBox.addEventListener("keyup", (event) => {
        if (event.keyCode === 13) {
            event.preventDefault();
            chatSendButton.click();
        }
    }); 

    const picker = new EmojiButton();
    picker.on('emoji', emoji => {
        chatInputBox.value += emoji;
    });
  
    const chatEmojiButton = document.querySelector('button#chat-emoji-button');
    chatEmojiButton.addEventListener('click', () => {
      picker.togglePicker(chatEmojiButton);
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
let username = 'John Doe';
let theme = '#dddddd';
function loadChat() {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername !== null) username = storedUsername;

    chatSocket = io('/chat');
    chatSocket.emit('login', {name: username});

    chatSocket.on('message', handleMessage);
    chatSocket.on('theme', (newTheme) => {
        handleThemeChange(newTheme);
    });

    chatSocket.on('users', (message) => {
        const users = message['users'];
        const usersString = users.join(', ');
        alert('Active users: ' + usersString);
    });

    chatLoaded = true;
}

function showUsers() {
    chatSocket.emit('users', {});
}

function changeSettings() {
    const picker = document.querySelector('#colorpicker');
    picker.focus();
    picker.click();
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    result = result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
    return `rgb(${result.r}, ${result.g}, ${result.b})`;
}

function handleThemeChange(newTheme) {
    const messages = [...document.querySelectorAll('.container')];
    messages.forEach((message) => {
        console.log(message.style.backgroundColor, hexToRgb(theme));
        if (message.style.backgroundColor === hexToRgb(theme)) {
            message.style.backgroundColor = newTheme;
        }
    });
    theme = newTheme;
}

function handleMessage(message) {
    const sender = encodeHTML(message.sender);
    const content = encodeHTML(message.message);

    if (sender === 'server') drawMessage(sender, content, 'right', 'lighter', '');
    else drawMessage(sender, content, 'right', theme, '<i class="fas fa-user-alt"></i>');
}

function drawMessage(sender, content, timeAlign, colorClass, avatar) {
    const chatContent = document.querySelector('.chat-content');
    const messageTemplate = document.querySelector('#message-template');
    
    const newMessage = messageTemplate.content.cloneNode(true);
    
    newMessage.querySelector('p').innerHTML = content;

    const newMessageContainer = newMessage.querySelector('.container');
    if (colorClass !== '' && colorClass[0] !== '#') newMessageContainer.classList.add(colorClass);
    if (colorClass[0] === '#') newMessageContainer.style.backgroundColor = colorClass;

    const currentDate = new Date();
    const newMessageTimeSpan = newMessage.querySelector(`span`);
    newMessageTimeSpan.classList.add(`time-${timeAlign}`);
    newMessageTimeSpan.innerHTML = `${sender} at ${currentDate.getHours()}:${currentDate.getMinutes()}`;

    newMessageContainer.innerHTML = avatar + newMessageContainer.innerHTML;

    chatContent.appendChild(newMessage);
    chatContent.scrollTop = chatContent.scrollHeight;
}

function unloadChat() {
    chatSocket.close();
    chatSocket = null;
    chatLoaded = false;
}

function encodeHTML(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

let chatLoaded = false;