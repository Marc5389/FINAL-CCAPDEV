const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    cuisine: String,
    location: String,
    'lowest-price': Number,
    'highest-price': Number,
    rating: Number
});

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

module.exports = Restaurant;
