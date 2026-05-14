const { z } = require('zod');

const addMoneySchema = {
    body: z.object({
        amount: z.number().positive('Amount must be positive'),
        paymentId: z.string().min(3, 'Invalid payment ID').optional().default(`PAY-${Date.now()}`)
    })
};

const addCardSchema = {
    body: z.object({
        brand: z.string().min(2, 'Card brand is required (e.g. Visa, Mastercard)'),
        last4: z.string().regex(/^\d{4}$/, 'last4 must be exactly 4 digits'),
        expMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, 'expMonth must be in MM format'),
        expYear: z.string().regex(/^\d{2,4}$/, 'expYear must be 2 or 4 digit year'),
        cardHolder: z.string().min(2, 'Card holder name is required'),
    })
};

module.exports = {
    addMoneySchema,
    addCardSchema,
};
