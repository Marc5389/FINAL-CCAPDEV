const mongoose = require('mongoose');


// Function to display the current date
function displayDate() {
    const dateElement = document.getElementById("date");
    const currentDate = new Date();
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    dateElement.textContent = currentDate.toLocaleDateString(undefined, options);
}

// Call the function when the page loads
window.onload = displayDate;


// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mco2', {useNewUrlParser: true, useUnifiedTopology: true });

const restaurantSchema = new mongoose.Schema({
    restaurantName: String,
    cuisine: String,
    location: String,
    rating: String,
  });
  
  // Create a Mongoose Model based on the schema
  const Restaurant = mongoose.model('Restaurant', restaurantSchema);
  
  // Fetch data from MongoDB
  Restaurant.find({}, (err, restaurants) => {
    if (err) {
      console.error(err);
      // Handle error
    } else {
      console.log(restaurants);
      // Process fetched restaurant data
    }
  });

document.addEventListener('DOMContentLoaded', function () {
    const searchContainer = document.querySelector('.search-container');
    const filterDropdown = document.getElementById('filterDropdown');

    // Toggle the filter dropdown on click
    searchContainer.addEventListener('click', function () {
        filterDropdown.style.display = (filterDropdown.style.display === 'block') ? 'none' : 'block';
    });

    // Prevent the filter dropdown from hiding when the mouse is over it
    filterDropdown.addEventListener('mouseover', function () {
        filterDropdown.style.display = 'block';
    });

    // Hide the filter dropdown when the mouse leaves
    filterDropdown.addEventListener('mouseout', function () {
        filterDropdown.style.display = 'none';
    });
});
