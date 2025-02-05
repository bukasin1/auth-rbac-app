const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'shipper', 'carrier'],
        default: 'shipper', // Default role
    },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
