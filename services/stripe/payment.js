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

/**
 * Authorize payment intent by customer and payment method.
 * @param amount
 * @param description
 * @param stripeCustomerId
 * @param pm_id
 * @returns {Promise<Stripe.Charge & {lastResponse: {headers: {[p: string]: string}, requestId: string, statusCode: number, apiVersion?: string, idempotencyKey?: string, stripeAccount?: string}}>}
 */
async function authorizePaymentIntentByCustomerAndPaymentMethod(
    amount,
    description,
    stripeCustomerId,
    pm_id,
){
    const paymentIntent = await stripe.paymentIntents.create({
        // Return a charge object
        amount: amount, // Unit: cents
        currency: 'usd',
        customer: stripeCustomerId,
        payment_method_types: ['card'],
        payment_method: pm_id,
        description: description,
        off_session: true,
        confirm: true,
    });
    return paymentIntent;
}

module.exports = {
    authorizeByCustomer,
    authorizeByCustomerAndSource,
    authorizePaymentIntentByCustomerAndPaymentMethod,
};
