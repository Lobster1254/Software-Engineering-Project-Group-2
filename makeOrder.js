//This file is for Make Order (Use case 7)

/*
to run makeOrder from postman:
1. POST http://localhost:8000/orders/create
  the body of your request should be as follows: (JSON)
  {
      "payment_method": "{payment_method -- i.e. "pm_card_visa" (NOT a card number)}",  
      "name": "{name}",
      "shipping_address": {
          "city": "{city}", 
          "country": "US", 
          "line1": "{street address}", 
          "line2": "{apt/unit# if necessary}",
          "postal_code": "{postal code}",
          "state": "{state, i.e. "NJ"}"
        },
        "billing_address_same_as_shipping_address": true
}
*/ 
              
/* NOTE:
"orderInfoArray" format: 
[[{shoppingcartproducts of user}], [{cartInf0}], [{product info}]];
*/
const http = require('http'); // for using stripe later....
const api_key= 'YOUR_API_KEY_HERE';
const stripe = require('stripe')(api_key);
const { validateAddress } = require('../src/validateAddresses.js'); 
const { getDiscounts } = require('../server.js');

async function createOrder(req, body, orderInfoArray, discounted_price) {
    body = JSON.parse(body);
    let orderProducts = {}; //for updating the orderProducts table as result of the new order -- will be implemented later
    let order = {};
    //let body = "";
    let shoppingCart = orderInfoArray[0];
    let shoppingCartProducts = orderInfoArray[1];
    let products = orderInfoArray[2];
    const validCart = await enoughStock(shoppingCartProducts, products);
    if(validCart) {
        order = await makeOrder(req, body, shoppingCart, shoppingCartProducts, discounted_price);
        console.log(order); // for testing (to see what's being returned as "order")
        body = order;
    } else {
        body = "Either there is not enough stock of certain products in your cart, or there are too many items in your cart.\nPlease remove out-of-stock items and ensure that you have no more than 50 products in your cart to place an order";
    }
    return body;
}

//function checks if there are products in cart & if the requested quantity is in stock
async function enoughStock(shoppingCartProducts, products) {
    let outOfStockCount = 0;
    if(shoppingCartProducts) {
        for(let i = 0; i < products.length; i++) {
            if(products[i].stock < shoppingCartProducts[i].quantity || shoppingCartProducts[i].quantity > 50) {
                outOfStockCount++;
            }  
        }
        if(outOfStockCount != 0) {
           return false;
        } else {
           return true;
        }
    }
}

//create order with given info (to be inserted into orders table)
async function makeOrder(req, body, shoppingCart, shoppingCartProduct, discounted_prices) {
   // if(await validateAddress(body) == true) { // implement address validation hereeeeeee
        
    let order = { 
        order_ID: await getOrder_ID(), 
        user_ID: shoppingCart[0].user_ID, 
        date_made: await getDate(), 
        payment_method: body.payment_method, 
        products_cost: discounted_prices, // to run without applying discounts: shoppingCart[0].cost, 
        tax_cost: (Math.ceil(discounted_prices * 0.066)*10)/10, //to run without applying discounts: replace "discounted_prices" with shoppingCart[0].cost
        total_cost: discounted_prices + (Math.ceil(discounted_prices * 0.066)*10)/10, // to run without applying discounts: Math.ceil((shoppingCart[0].cost + ((shoppingCart[0].cost) * 0.066)) * 10) / 10,
        shipping_cost: 0.00, //everyone loves free shipping --- but to be fixed later for the $$$
        delivery_address: JSON.stringify(body.shipping_address),
        billing_address: await getBillingAddress(body),
        status: 'not shipped'
    };
    
    //get payment intent if possible  ---> this is sent to stripe 
   // however, in current state transactions are NOT complete, we don't want to handle sensitive info through our server for security reasons at this point
   let newPaymentIntent = controller(body, order);
    
    //let order = stripeCreateCheckoutSession(shoppingCart); // this line is for if we decide to use stripe checkout instead of payment intents later on...
    return order;

}

//stripe controller
async function controller(req, order) {
    let pi = await getpaymentIntent(req, order);
    console.log(pi);
}

// stripe payment intent (for confirming billing details and processing transaction)
async function getpaymentIntent(body, order) {
    let taxCalculation = await calculateTax(order);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: taxCalculation.amount_total,
      payment_method: body.payment_method, 
      shipping: 
        {
            address: JSON.parse(order.delivery_address),
            name: body.name,
            tracking_number: null,
        },
      currency: 'usd',
      receipt_email: order.user_ID,
      automatic_payment_methods: {
        enabled: true,
      },
    });
    return paymentIntent;
    }

// apply discounts
async function applyDiscounts(order, shoppingCartProducts) {
    let discountedPrices = {};
    let discounted_total_cost = 0;
    for(let i = 0; i < shoppingCartProducts.length; i++) {
        let discountedPrice = getDiscounts(shoppingCartProducts[i].product_ID, shoppingCartProducts[i].cost);
        discountedPrices.push(discountedPrice);
        discounted_total_cost += discountedPrice;
    }
    order.total_cost = discounted_total_cost;
    return  order;

}

//get & format date for orders table
async function getDate() {
    const date = new Date(); 
    const year = date.getFullYear(); 
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`; 
    return formattedDate;
}

//generate random int order ids
async function getOrder_ID() {
    let min = 0;
    let max = 400000000;
    return await getRandomUniqueInt(min, max);
}

async function getBillingAddress(body){
    if (body.billing_address_same_as_shipping_address) {
        return JSON.stringify(body.shipping_address);
    } else if (!body.billing_address_same_as_shipping_address) {
        return JSON.stringify(body.billing_address);
    } else {
        return;
    }
}

async function calculateTax(order) {
    const calculation = await stripe.tax.calculations.create({
        currency: 'usd',
        line_items: [
          {
            amount: (order.products_cost)*100, //minimum purchase is $10
            reference: 'L1',
          },
        ],
        customer_details: {
          address: JSON.parse(order.delivery_address),
          address_source: 'shipping',
        },
      });
      return calculation;
}

//function to generate random integer between min and max (inclusive) for orders_ID
const usedNumbers = new Set();
async function getRandomUniqueInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  let randomInt;
  do {
    randomInt = Math.floor(Math.random() * (max - min + 1)) + min;
  } while (usedNumbers.has(randomInt));
  usedNumbers.add(randomInt);
  return randomInt;
}

/*
//This is the in-progress stripe checkout workflow (opted to use paymentIntents instead for demo 1 for more workflow customization (i.e. using discounts w/o subscription etc))
async function getShippingRate(shoppingCartProducts) {
    for(let i = 0; i < )
}
*/

/*
//function uses Stripe API complete checkout
async function stripeCreateCheckoutSession(cart) {
// NOT COMPLETE WHATSOEVER 
stripe.checkout.sessions.create({

    // shipping rate(s)
    shipping_address_collection: {
        allowed_countries: ['US'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'usd',
            },
            display_name: 'Free shipping',
            tax_behavior: 'exclusive',
            tax_code: 'txcd_10000000',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 1500,
              currency: 'usd',
            },
            display_name: 'Next day air',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 1,
              },
              maximum: {
                unit: 'business_day',
                value: 1,
              },
            },
          },
        },
      ],
    //line item(s)
    line_items: [
        {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: cart.price,
            quantity: cart.quantity,
        }
    ],
    // custom fields
    custom_fields: [
        {
          key: 'engraving',
          label: {
            type: 'custom',
            custom: 'Personalized engraving',
          },
          type: 'text',
        },
      ],
  mode: 'payment',
  success_url: `${YOUR_DOMAIN}/success.html`,
  cancel_url: `${YOUR_DOMAIN}/cancel.html`,
}).then(session => {
  res.writeHead(303, { 'Location': session.url });
  body = session;
  res.end();
  //return body;
}).catch(error => {
  console.error('Error creating checkout session:', error);
  res.writeHead(500, { 'Content-Type': 'text/plain' });
  res.end('Internal Server Error');
});
} 
// Serve static files
const filePath = './public' + (pathname === '/' ? '/index.html' : pathname);
fs.readFile(filePath, (err, data) => {
  if (err) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  } else {
    res.writeHead(200);
    res.end(data);
    console.log(body.payment_method);
  }
});

   // else {
   // res.writeHead(404, { 'Content-Type': 'text/plain' });
   // res.end('Not Found');
   // }


    */
module.exports = { createOrder };
