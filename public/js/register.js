function register() {
    const email = document.getElementById("email").value;
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    // Validate the email for the specific domain if needed
    if (!validateEmail(email)) {
        document.getElementById("errorMessage").innerHTML = "Invalid Email Address!";
        return;
    }

    // Prepare the data to be sent
    const formData = new FormData();
    formData.append('email', email);
    formData.append('username', username);
    formData.append('password', password);

    // Check if the user already exists
    checkUser(email, formData);
}

function validateEmail(email) {
    // Check if the email ends with specific domains
    return email.substr(email.length - 12) === "@dlsu.edu.ph" ||
           email.substr(email.length - 10) === "@gmail.com" ||
           email.substr(email.length - 10) === "@yahoo.com";
}

function checkUser(emailValue, formData) {
    fetch('/email?email=' + emailValue, {method: 'GET'})
        .then(res => {
            if(res.status == 200) {
                document.getElementById("errorMessage").innerHTML = "Account already Exists!";
            } else {
                registerUser(formData);
            }
        });
}

function registerUser(formData) {
    const data = new URLSearchParams(formData);

    fetch('/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: data
    }).then(() => {
        document.getElementById("errorMessage").innerHTML = "Successfully Registered!";
    });
}
