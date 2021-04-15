const stripe = require('./config');

/**
 * get list of cards by customer id
 * @param stripeCustomerId
 * @returns {Promise<ApiList<Stripe.PaymentMethod> & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}}>}
 */
async function getCardsByCustomerId(stripeCustomerId){
    const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: 'card',
    });
    return paymentMethods;
}

/**
 * add a new card by stripe customer id with token
 * @param cardToken
 * @param stripeCustomerId
 * @returns {Promise<(AccountDebitSource & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(AlipayAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(BankAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(BitcoinReceiver & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Card & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Source & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})>}
 */
async function addNewCardByCustomerId(cardSource, stripeCustomerId){
    const card =  await stripe.customers.createSource(
        stripeCustomerId,
        {source: cardSource},
    );
    return card;
}

/**
 * delete card by customer id
 * @param cardId
 * @param stripeCustomerId
 * @returns {Promise<(AccountDebitSource & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(AlipayAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(BankAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(BitcoinReceiver & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Card & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Source & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Stripe.DeletedAlipayAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Stripe.DeletedBankAccount & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Stripe.DeletedBitcoinReceiver & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})|(Stripe.DeletedCard & {headers: {[p: string]: string}; lastResponse: {requestId: string; statusCode: number; apiVersion?: string; idempotencyKey?: string; stripeAccount?: string}})>}
 */
async function removeCardByCustomerId(cardId, stripeCustomerId){
    const deleted = await stripe.customers.deleteSource(
        stripeCustomerId,
        cardId,
    );
    return deleted;
}

/**
 * update customer's default payment method
 * @param cardSource
 * @param stripeCustomerId
 * @returns {Promise<void>}
 */
async function updateDefaultSource(cardSource, stripeCustomerId){
    const customer = await stripe.customers.update(
        stripeCustomerId,
        {default_source: cardSource},
    );
}
