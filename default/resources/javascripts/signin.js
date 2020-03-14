async function doSignin(name, password) {
    const resp = await fetch('/signin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({name, password}),
    });

    const data = await resp.json();

    if (resp.status !== 200) {
        console.log('failed');
    } else if (data.redirect === 'admin') {
        window.location.href = '/admin/dashboard.html';
    } else {
        window.location.href = '/';
    }
}

window.addEventListener('load', () => {
    const submitForm = document.getElementById('signin');
    submitForm.onsubmit = () => {
        const nameField = document.getElementById('name-field');
        const passwordField = document.getElementById('password-field');

        nameField.style = 'background-color: white;';
        passwordField.style = 'background-color: white;';

        const name = nameField.value;
        const password = passwordField.value;
        
        if (name === '' || password === '') {
            if (name === '') nameField.style = 'background-color: #ff9999;';
            if (password === '') passwordField.style = 'background-color: #ff9999';
        } else {
            doSignin(name, password);
        }

        return false; // use AJAX instead of form submission
    };
});