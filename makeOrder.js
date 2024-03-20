//This file is for Make Order 
/*
    to trigger makeOrder, 
        1. start server
        2. on Postman: send an http "POST" request to 'localhost.../make-order/{user_ID}'
        3. it will send response notifying you that order has been placed

const http = require('http'); // for using stripe later....
const api_key = 'YOUR_API_KEY_HERE';
const stripe = require('stripe')(api_key);
              
/* NOTE:
"orderInfoArray" format: 
[[{shoppingcartproducts of user}], [{cartInf0}], [{product info}]];
*/
async function createOrder(orderInfoArray) {
    let orderProducts = {}; //for updating the orderProducts table as result of the new order -- will be implemented later
    let order = {};
    let body = "";
    let shoppingCart = orderInfoArray[0];
    let shoppingCartProducts = orderInfoArray[1];
    let products = orderInfoArray[2];
    const validCart = await enoughStock(shoppingCartProducts, products);
    if(validCart) {
        order = await makeOrder(shoppingCart, billingInfo);
        console.log(order); // for testing (to see what's being returned as "order")
        body = order;
    } else {
        body = "Either there is not enough stock of certain products in your cart, or there are too many items in your cart.\nPlease remove out-of-stock items and ensure that you have no more than 50 products in your cart to place an order";
    }
    return body;
}

//function checks if there are products in cart & if the requested quantity is in stock
async function enoughStock(shoppingCartProducts, products) {
    if(shoppingCartProducts[i].quantity > 50) {
        return false; //there are too many products in your cart!
    }
    let outOfStockCount = 0;
    if(shoppingCartProducts) {
        for(let i = 0; i < products.length; i++) {
            if(products[i].stock < shoppingCartProducts[i].quantity) {
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

//for testing purposes before stripe is implemented
let billingInfo = {
    payment_method: 'pm_card_visa',
    shipping_address: '76 Pollard rd, Mountain Lakes, NJ',
    billing_address: '76 Pollard rd, Mountain Lakes, NJ'
}

//create order with given info (to be inserted into orders table)
async function makeOrder(shoppingCart, billingInfo) {
    let order = { 
        order_ID: await getOrder_ID(), 
        user_ID: shoppingCart[0].user_ID, 
        date_made: await getDate(), 
        payment_method: billingInfo.payment_method, 
        products_cost: shoppingCart[0].cost, 
        tax_cost: parseFloat((0.07*shoppingCart[0].cost).toFixed(2)), 
        shipping_cost: 0.00, //everyone loves free shipping --- but to be fixed later for the $$$
        delivery_address: billingInfo.shipping_address,
        billing_address: billingInfo.billing_address,
        status: 'not shipped'
    };
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

//function uses Stripe API complete checkout
async function stripeCheckout(cart) {
// NOT COMPLETE WHATSOEVER 
}
    
module.exports = { createOrder };
