const stripe = require('./config');

/**
 * authorize payment by customer
 * @param amount
 * @param description
 * @param stripeCustomer
 * @returns {Promise<Stripe.Charge & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}}>}
 */
async function authorizeByCustomer(amount, description, stripeCustomerId) {
    const charge = await stripe.charges.create({
        // Return a charge object
        amount: amount, // Unit: cents
        currency: 'usd',
        capture: false,
        customer: stripeCustomerId,
        description: description,
    });
    return charge;
}

/**
 * authorize payment by customer
 * @param amount
 * @param description
 * @param stripeCustomer
 * @param sourceId
 * @returns {Promise<Stripe.Charge & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}}>}
 */
async function authorizeByCustomerAndSource(
    amount,
    description,
    stripeCustomerId,
    sourceId,
) {
    const charge = await stripe.charges.create({
        // Return a charge object
        amount: amount, // Unit: cents
        currency: 'usd',
        capture: false,
        customer: stripeCustomerId,
        source: sourceId,
        description: description,
    });
    return charge;
}

module.exports = {authorizeByCustomer, authorizeByCustomerAndSource};
