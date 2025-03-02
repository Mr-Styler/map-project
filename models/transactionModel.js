const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    reference: { type: String, required: true, unique: true }, // Paystack transaction reference
    email: { type: String, required: true }, // Email of payer
    amount: { type: Number, required: true }, // Amount paid (in kobo)
    currency: { type: String, default: 'NGN' }, // Currency (default to NGN)
    status: { 
        type: String, 
        enum: ['pending', 'success', 'failed'], 
        default: 'pending' 
    }, // Transaction status
    metadata: { type: Object, default: {} }, // Optional metadata from Paystack
    createdAt: { type: Date, default: Date.now }, // Transaction creation time
});

module.exports = mongoose.model('Transaction', transactionSchema);
