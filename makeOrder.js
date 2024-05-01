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


//This file is for Make Order (Use case 7)
              
/* NOTE:
"orderInfoArray" format: 
[[{shoppingcartproducts of user}], [{cartInf0}], [{product info}]];
*/
//const http = require('http'); // for using stripe later....
//const api_key= 'YOUR_API_KEY_HERE';
//const stripe = require('stripe')(api_key);
const { addressValidation_controller } = require('../src/validateAddresses.js');
//const url = require('url');
//const fs = require('fs');
const { stripeServer } = require('../stripeServer.js');
//const { sendEmail } = require('./send_email.js'); // for implementing email recipts - TODO

async function createOrder(req, body, orderInfoArray, discounted_price) {
    body = JSON.parse(body);
    let order = {};
    let shoppingCart = orderInfoArray[0];
    let shoppingCartProducts = orderInfoArray[1];
    let products = orderInfoArray[2];
    let validAddress = true;
    validAddress = await addressValidation_controller(body);
    if(validAddress != 1) {
      return body = "invalid shipping address";
    }
    const validCart = await enoughStock(shoppingCartProducts, products);
    if(validCart && validAddress) { 
        order = await makeOrder(req, body, shoppingCart, shoppingCartProducts, discounted_price);
        console.log(order); // for testing (to see what's being returned as "order")
        body = order;
    } else  { 
        body = "please remove out of stock items from your cart & ensure that you have no more than 50 items in your cart.";
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
        
    let order = { 
        order_ID: await getOrder_ID(), 
        email: shoppingCart[0].email, 
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

    let result = await stripeServer(order); //initiates stripe checkout
    //sendEmail(); // if stripeServer successfully processes payment, send emil IMPLEMEN
   return order;

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

module.exports = { createOrder };
