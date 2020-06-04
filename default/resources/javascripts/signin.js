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
        document.querySelector('label.error').style.display = "block";
        return ;
    }
    
    localStorage.setItem('username', name);

    if (data.redirect === 'admin') {
        window.location.href = '/admin/dashboard.html';
    } else {
        window.location.href = '/';
    }
}

window.addEventListener('load', () => {
    handleSignin();
    handleRegister();
});

function handleSignin() {
    const submitForm = document.getElementById('signin');
    if (submitForm === null) return ;

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
}

function handleRegister() {
    const submitForm = document.getElementById('register');
    if (submitForm === null) return ;
    console.log(submitForm);

    submitForm.onsubmit = () => {
        const nameField = document.getElementById('name-field');
        const passwordField = document.getElementById('password-field');
        const repeatPasswordField = document.getElementById('repeat-password-field');
        const emailField = document.getElementById('email-field');
        const ageField = document.getElementById('age-field');

        nameField.style = 'background-color: white;';
        passwordField.style = 'background-color: white;';

        const name = nameField.value;
        const password = passwordField.value;
        const repeatPassword = repeatPasswordField.value;
        const email = emailField.value;
        const age = ageField.value;
        
        if (name === '' || password === '' || repeatPassword === '' || email === '' || repeatPassword !== password) {
            if (name === '') nameField.style = 'background-color: #ff9999;';
            if (password === '') passwordField.style = 'background-color: #ff9999';
            if (repeatPassword === '' || repeatPassword !== password) repeatPasswordField.style = 'background-color: #ff9999';
            if (email === '') emailField.style = 'background-color: #ff9999';
        } else {
            doRegister(name, password, email, age);
        }

        return false; // use AJAX instead of form submission
    };
}


async function doRegister(name, password, email, age) {
    const resp = await fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({name, password, email, age}),
    });

    if (resp.status !== 200) {
        document.querySelector('label.error').style.display = "block";
        return ;
    }

    doSignin(name, password);
}