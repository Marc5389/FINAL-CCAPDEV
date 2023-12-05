const server = require('/login-register/server.js');

function loginUser(event) {
    event.preventDefault(); // Prevent default form submission
  
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
  
    fetch('http://localhost:3000/mco1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email, password: password }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Invalid email or password');
      }
      return response.text();
    })
    .then(data => {
      if (data === "Login successful") {
        window.location.href = 'Major.html';
      } else {
        throw new Error('Invalid email or password');
      }
    })
    .catch((error) => {
      alert(error.message);
    });
  }