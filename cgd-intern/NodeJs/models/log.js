const mongoose = require('mongoose');

var Log = mongoose.model('Log', {
    id_occupant: { type: String },
    name: { type: String },
    license_plate: { type: String },
    status: { type: String, enum: ['in', 'out'] },
    date: { type: String },
    accuracy: { type: String },
});

module.exports = { Log };