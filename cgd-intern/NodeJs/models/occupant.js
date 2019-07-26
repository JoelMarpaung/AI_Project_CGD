const mongoose = require('mongoose');

var Occupant = mongoose.model('Occupant', {
    name: { type: String },
    phone_number: { type: String },
    house_number: { type: String },
    images: { type: String },
    license_plate: { type: String }
});

module.exports = { Occupant };