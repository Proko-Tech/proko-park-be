const stripe = require('./config');

/**
 * get list of cards by customer id
 * @param stripeCustomerId
 * @returns {Promise<ApiList<Stripe.PaymentMethod> & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}}>}
 */
async function getCardsByCustomerId(stripeCustomerId) {
    const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: 'card',
    });
    return paymentMethods;
}

/**
 * get card by customer id and source id
 * @param stripeCustomerId
 * @param sourceId
 * @returns {Promise<(AccountDebitSource & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(AlipayAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(BankAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(BitcoinReceiver & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Card & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Source & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})>}
 */
async function getCardByCustomerId(stripeCustomerId, sourceId) {
    const card = await stripe.customers.retrieveSource(
        stripeCustomerId,
        sourceId,
    );
    return card;
}

/**
 * add a new card by stripe customer id with token
 * @param cardToken
 * @param stripeCustomerId
 * @returns {Promise<(AccountDebitSource & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(AlipayAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(BankAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(BitcoinReceiver & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Card & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Source & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})>}
 */
async function addNewCardByCustomerId(cardSource, stripeCustomerId) {
    const card = await stripe.customers.createSource(stripeCustomerId, {
        source: cardSource,
    });
    return card;
}

/**
 * delete card by customer id
 * @param cardId
 * @param stripeCustomerId
 * @returns {Promise<(AccountDebitSource & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(AlipayAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(BankAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(BitcoinReceiver & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Card & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Source & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Stripe.DeletedAlipayAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Stripe.DeletedBankAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Stripe.DeletedBitcoinReceiver & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Stripe.DeletedCard & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})>}
 */
async function removeCardByCustomerId(cardId, stripeCustomerId) {
    const deleted = await stripe.customers.deleteSource(
        stripeCustomerId,
        cardId,
    );
    return deleted;
}

/**
 * Remove a payment method by payment method id.
 * @param pm_id
 * @returns {Promise<Stripe.PaymentMethod & {lastResponse: {headers: {[p: string]: string}, requestId: string, statusCode: number, apiVersion?: string, idempotencyKey?: string, stripeAccount?: string}}>}
 */
async function removePaymentMethodByPaymentMethodId(pm_id) {
    const paymentMethod = await stripe.paymentMethods.detach(pm_id);
    return paymentMethod;
}

/**
 * update customer's default payment method
 * @param cardSource
 * @param stripeCustomerId
 * @returns {Promise<void>}
 */
async function updateDefaultSource(cardSource, stripeCustomerId) {
    const customer = await stripe.customers.update(stripeCustomerId, {
        default_source: cardSource,
    });
    return customer;
}

/**
 * create new customer by name and email
 * @param name
 * @param email
 * @returns {Promise<*>}
 */
async function create(name, email) {
    const customer = await stripe.customers.create({
        name,
        email,
    });
    return customer;
}

/**
 * Get ephemeral key for a given customer.
 * @param customer_id
 * @returns {Promise<Stripe.EphemeralKey & {lastResponse: {headers: {[p: string]: string}, requestId: string, statusCode: number, apiVersion?: string, idempotencyKey?: string, stripeAccount?: string}}>}
 */
async function getEphemeralKeyByCustomerId(customer_id) {
    const ephemeralKey = await stripe.ephemeralKeys.create(
        {customer: customer_id},
        {apiVersion: '2020-08-27'},
    );
    return ephemeralKey;
}

/**
 * Create setup intent by customer id.
 * @param customer_id
 * @param payment_method_types
 * @returns {Promise<Stripe.SetupIntent & {lastResponse: {headers: {[p: string]: string}, requestId: string, statusCode: number, apiVersion?: string, idempotencyKey?: string, stripeAccount?: string}}>}
 */
async function createSetupIntentByCustomerId(
    customer_id, payment_method_types) {
    const setupIntent = await stripe.setupIntents.create({
        ...{customer: customer_id, payment_method_types},
    });
    return setupIntent;
}

/**
 * Get payment method by customer id and payment method id.
 * @param customer_id
 * @param pm_id
 * @returns {Promise<*>}
 */
async function getPaymentMethodsByCustomerIdAndPMId(customer_id, pm_id) {
    const paymentMethod = await stripe.customers.retrievePaymentMethod(
        customer_id, pm_id,
    );
    return paymentMethod;
}

module.exports = {
    create,
    getCardsByCustomerId,
    getCardByCustomerId,
    addNewCardByCustomerId,
    removeCardByCustomerId,
    updateDefaultSource,
    getEphemeralKeyByCustomerId,
    createSetupIntentByCustomerId,
    getPaymentMethodsByCustomerIdAndPMId,
    removePaymentMethodByPaymentMethodId,
};
