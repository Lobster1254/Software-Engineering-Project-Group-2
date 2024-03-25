const http = require('http');
const fs = require('fs');
const querystring = require('querystring');
const port = 8000;
let dBCon = {};
let loginhtml;
let logouthtml;
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();
const CLIENT_ID = "391687210332-d60o4n8rp92estqtv9ejsugmo2ohpqj0.apps.googleusercontent.com";

const minReviewScore = 1;
const maxReviewScore = 5;

try {
    loginhtml = fs.readFileSync('login.html', 'utf8');
    logouthtml = fs.readFileSync('logout.html', 'utf8');
} catch (error) {
    throw error;
}



let pass = "";

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

readline.question('Enter password: ', pass => { // read password
    const mysql = require("mysql2");
    dBCon = mysql.createConnection({ // MySQL database
        host: "localhost",
        user: "root",
        database: "lifesynchub",
        password: pass
    });
    dBCon.connect(function(err) { if (err) throw err; });
    server.listen(port);
    console.log('Listening on port ' + port + '...');

});

const server = http.createServer((req, res) => {
    let urlParts = [];
    let segments = req.url.split('/');
    for (let i = 0, num = segments.length; i < num; i++) {
      if (segments[i] !== "") { // check for trailing "/" or double "//"
        urlParts.push(segments[i]);
      }
    }
    let resMsg = {}, body = '';
    req.on('data', function (data) {
      body += data.toString();
      if (body.length > 1e6) {
        res.writeHead(413); // 413 payload too large
        res.write("Payload too large.");
        res.end();
        req.destroy();
      }
    });
    req.on('end', async function () {
        // Initialize a variable to store the parsed body 
        // (USED FOR POST OR ANY CALL THAT REQUIRES THE BODY ^)
        let parsedBody = null;
        
        if (urlParts[0]) {
            switch(urlParts[0]) {
                case 'product-catalog':
                    resMsg = await productCatalog(req, body, urlParts);
                    break;
                case 'product-reviews':
                    resMsg = await productReviews(req, body, urlParts);
                    break;
                case 'shopping-cart':
                    resMsg = await shoppingCart(req, body, urlParts);
                    break;
                case 'orders':
                    resMsg = await orders(req, body, urlParts);
                    break;
                case 'post-review': // New case for posting a review
                    resMsg = await postReview(req, body);
                    break;
                case 'login':
                    switch(req.method) {
                        case 'POST':
                            let validID;
                            validID = await verify(body).catch(validID = Error);
                            if (validID instanceof Error) {
                                resMsg.code = 503;
                                resMsg.hdrs = {"Content-Type" : "text/html"};
                                resMsg.body = "Failure while accessing Google API";
                            } else if (validID != -1) {
                                resMsg.code = 200;
                                resMsg.hdrs = {"Content-Type" : "text/html", "Set-Cookie":"user_ID=" + body + "; HttpOnly"};
                            }
                            break;
                        default:
                            break;
                    }
                    break;
                case 'logout':
                    switch(req.method) {
                        case 'POST':
                            resMsg.code = 200;
                            resMsg.hdrs = {"Content-Type" : "text/html", "Set-Cookie": "user_ID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"};
                            break;
                        default:
                            break;
                    }
                    break;
                default:
                    break;
            }
        } else {
            switch(req.method) {
                case 'GET':
                    let user_ID = await getUserID(req);
                    if (user_ID instanceof Error)
                        resMsg = failedDB();
                    else if (user_ID == -1) {
                        resMsg.code = 200;
                        resMsg.hdrs = {"Content-Type" : "text/html"};
                        resMsg.body = loginhtml;
                    } else {
                        resMsg.code = 200;
                        resMsg.hdrs = {"Content-Type" : "text/html"};
                        resMsg.body = logouthtml;
                    }
                    break;
                default:
                    break;
            }
        }
        if (!resMsg.code) {
            resMsg.code = 404;
            resMsg.hdrs = {"Content-Type" : "text/html"};
            resMsg.body = "404 Not Found";
        }
        res.writeHead(resMsg.code, resMsg.hdrs);
        res.end(resMsg.body);
    });
});

function parseCookies (req) {
    const list = {};
    const cookieHeader = req.headers?.cookie;
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function(cookie) {
        let [ name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}

// Returns Object of availability status and stock quantity
async function verifyProductAvailability(productID) {
    const [rows] = await dBCon.promise().query('SELECT stock FROM products WHERE product_ID = ?', [productID]);
    if (rows.length === 0) {
        return { exists: false, available: false, stock: 0 };
    }
    
    const stock = rows[0].stock;
    return { exists: true, available: stock > 0, stock };
}

// Returns Object of availbility and total Quantity of said object
async function checkCartQuantity(userEmail) {
    const [rows] = await dBCon.promise().query('SELECT SUM(quantity) AS totalQuantity FROM shoppingcartproducts WHERE email = ?', [userEmail]);
    if (rows.length === 0 || rows[0].totalQuantity === null) {
        return { empty: true, totalQuantity: 0 };
    }

    return { empty: false, totalQuantity: rows[0].totalQuantity };
}


async function verify(user_ID) { // returns error if error, -1 if invalid ID, email if valid ID
    const ticket = await client.verifyIdToken({
        idToken: user_ID,
        audience: CLIENT_ID,
    }).catch(error => {
        return error;
    });
    if (!ticket)
        return -1;
    const payload = ticket.getPayload();
    if (payload)
        return payload.email;
    else
        return -1;
}

server.once('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      console.log('Port ' + port + ' is already in use. Please kill all processes associated with this port before launching this server.');
      process.exit();
    }
});

const getProductReviews = async(req, body, product_ID) => { // returns array, index 0 = avg rating, index 1 = score distribution index 2 = JSON of reviews
    let reviewInfo = [];
    let reviewQuery = "select r.*, IFNULL(2*sum(h.rating)-count(h.rating), 0) helpfulness from productreviews r left join helpfulnessratings h on r.email = h.review_email and r.product_ID = h.product_ID where r.product_ID = '" + product_ID + "'group by email, product_ID";
    if (body != "") {
        let sorter;
        try {
            sorter = JSON.parse(body);
        } catch (error) {
            return error;
        }
        if (sorter.hasOwnProperty("sort_by")) {
            if (sorter.sort_by == "date_asc") {
                reviewQuery = reviewQuery + " order by created asc";
            } else if (sorter.sort_by == "date_desc") {
                reviewQuery = reviewQuery + " order by created desc";
            } else if (sorter.sort_by == "help_asc") {
                reviewQuery = reviewQuery + " order by helpfulness asc";
            } else if (sorter.sort_by == "help_desc") {
                reviewQuery = reviewQuery + " order by helpfulness desc";
            } else if (sorter.sort_by == "score_asc") {
                reviewQuery = reviewQuery + " order by score asc";
            } else {
                reviewQuery = reviewQuery + " order by score desc";
            }
        }
    }  
    await dBCon.promise().query(reviewQuery).then(([ result ]) => {
        if (result[0]) {
            let sum = 0;
            /* distribution is an array that stores the quantity of each review score on a product
               distribution[0] is the number of reviews with the lowest review score and distribution[distribution.length-1] is the number of reviews with the highest review score
             */
            let distribution = Array(maxReviewScore - minReviewScore + 1).fill(0);
            for (let i = 0; i < result.length; i++) {
                distribution[result[i].score - minReviewScore]++;
                sum = sum + result[i].score;
            }
            reviewInfo[0] = sum/result.length;
            reviewInfo[1] = distribution;
            reviewInfo[2] = result;
        }
    }).catch(error => {
        reviewInfo = "Failed to load reviews.";
    });
    return reviewInfo;
}

const getDiscounts = async(product_ID, base_price) => { // returns array, index 0 = discounted price, index 1 = JSON of discounts
    let discountQuery = "select d.* from discounts d, discountedproducts p where ((d.discount_ID = p.discount_ID and p.product_ID = '" + product_ID + "' and d.scope = 'product_list') or (d.category = (select category from products where product_ID = '" + product_ID + "') and d.scope = 'category')) and d.end_date >= CURDATE() and IFNULL(d.start_date, CURDATE()) <= CURDATE()";
    let discounts = [];
    await dBCon.promise().query(discountQuery).then(([ result ]) => {
        if (result[0]) {
            let set_price = base_price;
            let lowered_price = base_price;
            let final_discounted_price;
            for (let i = 0; i < result.length; i++) {
                if (result[i].type == "set_price") {
                    if (result[i].set_price != null && result[i].set_price < set_price)
                        set_price = result[i].set_price;
                } else {
                    if (result[i].percent_off != null && result[i].percent_off <= 100 && result[i].percent_off > 0)
                        lowered_price = lowered_price * (100-result[i].percent_off)/100;
                }
            }
            if (set_price < base_price) 
                final_discounted_price = set_price;
            else 
                final_discounted_price = lowered_price;
            final_discounted_price = roundPrice(final_discounted_price);
            discounts[0] = final_discounted_price;
            discounts[1] = result;
        }
    }).catch(error => {
        discounts = "Failed to load discounts.";
    });
    return discounts;
}

const getProductInfo = async(req, body, product_ID) => { // returns stringified JSON of product info
    let productQuery = "select * from products where product_ID = '" + product_ID + "'";
    let email = await getEmail(req);
    if (email instanceof Error) {
        email = -1;
    }
    let ordersQuery = "select o.order_ID, o.date_made, p.quantity, o.status from orders o, orderproducts p where o.order_ID = p.order_ID and o.email = '" + email + "' and p.product_ID = '" + product_ID + "'";
    let cartQuery = "select p.quantity from shoppingcartproducts p where p.email = '" + email + "' and p.product_ID = '" + product_ID + "'";
    let resMsg = {};
    let isProduct = true;
    await dBCon.promise().query(productQuery).then(([ result ]) => {
        if (result[0]) {
            resMsg.body = result[0];
        } else {
            isProduct = false;
        }
    }).catch(error => {
        return failedDB();
    });
    if (!isProduct)
        return resMsg;
    let discounts = await getDiscounts(product_ID, resMsg.body.price);
    if (discounts) {
        if (typeof discounts === "string") {
            resMsg.body.discounts = discounts;
        } else {
            resMsg.body.discounted_price = discounts[0];
            resMsg.body.discounts = discounts[1];
        }
    }
    if (email != -1) {
        await dBCon.promise().query(cartQuery).then(([ result ]) => {
            if (result[0]) {
                resMsg.body.in_cart = result[0].quantity;
            } else {
                resMsg.body.in_cart = 0;
            }
        }).catch(error => {
            resMsg.body.cart = "Failed to load cart.";
        })
        await dBCon.promise().query(ordersQuery).then(([ result ]) => {
            if (result[0]) {
                resMsg.body.orders = result;
            }
        }).catch(error => {
            resMsg.body.orders = "Failed to load orders.";
        });
    }
    let reviewInfo = await getProductReviews(req, body, product_ID);
    if (reviewInfo) {
        if (typeof reviewInfo === "string") {
            resMsg.body.reviews = reviewInfo;
        } else if (reviewInfo instanceof Error) {
            resMsg.code = 400;
            resMsg.hdrs = {"Content-Type" : "text/html"};
            resMsg.body = reviewInfo.toString();
            return resMsg;
        } else {
            resMsg.body.average_rating = reviewInfo[0];
            resMsg.body.rating_distribution = reviewInfo[1];
            resMsg.body.reviews = reviewInfo[2];
        }
    }
    resMsg.code = 200;
    resMsg.hdrs = {"Content-Type" : "application/json"};
    resMsg.body = JSON.stringify(resMsg.body);
    return resMsg;
}

function failedDB() { // can be called when the server fails to connect to the database and that failure is fatal to the use case's function
    resMsg = {};
    resMsg.code = 503;
    resMsg.hdrs = {"Content-Type" : "text/html"};
    resMsg.body = "Failed access to mySQL.";
    return resMsg;
}

async function searchProducts(req, body, keyword) {
    if (keyword && keyword.length > 50) {
        return {
            code: 400,
            hdrs: {"Content-Type" : "text/html"},
            body: "Keyword length must not exceed 50 characters"
        };
    }

    resMsg = {};
    let baseQuery = "select p.*, IFNULL(rating.average_rating, 0) average_rating from products p left join (select avg(r.score) average_rating, p.product_ID from products p, productreviews r where p.product_ID = r.product_ID group by p.product_ID) rating on rating.product_ID = p.product_ID";
    let whereClauses = [];
    let parameters = [];
    if (keyword) {
        whereClauses.push("MATCH(name, description, category) AGAINST(?)");
        parameters.push(keyword);
    }
    let min_price = -1;
    if (body != "") {
            let filters;
        try {
            filters = JSON.parse(body);
        } catch (error) {
            resMsg.code = 400;
            resMsg.hdrs = {"Content-Type" : "text/html"};
            resMsg.body = error.toString();
            return resMsg;
        }
        if (filters.category) { // filter by category
            whereClauses.push("category = ?");
            parameters.push(filters.category);
        }
        if (filters.min_price) { // minimum price
            whereClauses.push("price >= ?");
            parameters.push(filters.min_price);
            min_price = filters.min_price;
        }
        if (filters.max_price) { // maximum price
            whereClauses.push("price <= ?");
            parameters.push(filters.max_price);
        }
        if (filters.min_rating) { // minimum average review rating
            whereClauses.push("IFNULL(rating.average_rating, 0) >= ?");
            parameters.push(filters.min_rating);
        }
        if (filters.max_rating) { // maximum average review rating
            whereClauses.push("IFNULL(rating.average_rating, 0) <= ?");
            parameters.push(filters.max_rating);
        }
        if (filters.material) { // filter by material
            whereClauses.push("material = ?");
            parameters.push(filters.material);
        }
        if (filters.color) { // filter by color
            whereClauses.push("color = ?");
            parameters.push(filters.color);
        }
        if (filters.min_length) { // filter by minimum length
            whereClauses.push("length_in >= ?");
            parameters.push(filters.min_length);
        }
        if (filters.max_length) { // filter by maximum length
            whereClauses.push("length_in <= ?");
            parameters.push(filters.max_length);
        }
        if (filters.min_width) { // filter by minimum width
            whereClauses.push("width_in >= ?");
            parameters.push(filters.min_width);
        }
        if (filters.max_width) { // filter by maximum width
            whereClauses.push("width_in <= ?");
            parameters.push(filters.max_width);
        }
        if (filters.min_height) { // filter by minimum height
            whereClauses.push("height_in >= ?");
            parameters.push(filters.min_height);
        }
        if (filters.max_height) { // filter by maximum height
            whereClauses.push("height_in <= ?");
            parameters.push(filters.max_height);
        }
        if (filters.min_weight) { // filter by minimum weight
            whereClauses.push("weight_oz >= ?");
            parameters.push(filters.min_weight);
        }
        if (filters.max_weight) { // filter by maximum weight
            whereClauses.push("weight_oz <= ?");
            parameters.push(filters.max_weight);
        }
        if (filters.length_in) { // filter by length
            whereClauses.push("length_in = ?");
            parameters.push(filters.length_in);
        }
        if (filters.width_in) { // filter by width
            whereClauses.push("width_in = ?");
            parameters.push(filters.width_in);
        }
        if (filters.height_in) { // filter by height
            whereClauses.push("height_in = ?");
            parameters.push(filters.height_in);
        }
        if (filters.weight_oz) { // filter by weight
            whereClauses.push("weight_oz = ?");
            parameters.push(filters.weight_oz);
        }
        if (filters.price) { // filter by specific price
            whereClauses.push("price = ?");
            parameters.push(filters.price);
        }
    }
    let searchQuery = baseQuery;
    if (whereClauses.length > 0) {
        searchQuery += " WHERE " + whereClauses.join(" AND ");
    }
    try {
        const [result] = await dBCon.promise().query(searchQuery, parameters);
        resMsg.code = 200;
        resMsg.hdrs = {"Content-Type" : "application/json"};
        resMsg.body = result;
    } catch (error) {
        return failedDB();
    }
    let discountInfo;
    for (let i = 0; i < resMsg.body.length; i++) {
        let currentProduct = resMsg.body[i];
        discountInfo = await getDiscounts(currentProduct.product_ID, currentProduct.price);
        if (typeof discounts === "string") {
            currentProduct.discounted_price = currentProduct.price;
        } else {
            currentProduct.discounted_price = discountInfo[0];
        }
        resMsg.body[i] = currentProduct;
        if (min_price > discountInfo[0])
            if (i == 0) 
                resMsg.body[0] = null;
            else
                for (let i = 1; i < resMsg.body.length; i++)
                    resMsg.body[i] = resMsg.body[i-1];
    }
    if (Array.isArray(resMsg.body)) {
        resMsg.body = resMsg.body.filter((product) => product != null);
    }
    resMsg.body = JSON.stringify(resMsg.body);
    return resMsg;
}

async function productCatalog(req, body, urlParts) {
    switch(req.method) {
        case 'GET':
            if (urlParts[1]) {
                if (urlParts[1].startsWith("search?")) {
                    let param = querystring.decode(urlParts[1].substring(7));
                    let keyword = param.key || null;
                    return await searchProducts(req, body, keyword);
                } else {
                    let product_ID = urlParts[1];
                    return await getProductInfo(req, body, product_ID);
                }
            } else {
                return {};
            }
        default:
            return {};
    }
}


async function productReviews(req, body, urlParts) {
    switch(req.method) {
        case 'GET':
            if (urlParts[1]) {
                let resMsg = {};
                let product_ID = urlParts[1];
                let isProduct = true;
                await dBCon.promise().query("select product_ID from products where product_ID = '" + product_ID + "'").then(([ result ]) => {
                    if (!result[0])
                        isProduct = false;
                }).catch(error => {
                    return failedDB();
                });
                if (!isProduct)
                    return resMsg;
                let reviewInfo = await getProductReviews(req, body, product_ID);
                if (reviewInfo) {
                    if (typeof reviewInfo === "string") {
                        return failedDB();
                    } else if (reviewInfo instanceof Error) {
                        resMsg.code = 400;
                        resMsg.hdrs = {"Content-Type" : "text/html"};
                        resMsg.body = reviewInfo.toString();
                        return resMsg;
                    } else {
                        resMsg.body = {};
                        resMsg.body.average_rating = reviewInfo[0];
                        resMsg.body.rating_distribution = reviewInfo[1];
                        resMsg.body.reviews = reviewInfo[2];
                    }
                }
                resMsg.code = 200;
                resMsg.hdrs = {"Content-Type" : "application/json"};
                resMsg.body = JSON.stringify(resMsg.body);
                return resMsg;
            } else {
                return {};
            }
        case 'DELETE':
            // Handle DELETE requests to delete reviews
            if (urlParts[1] === 'delete') {
                try {
                    // Parse the request body to extract productID
                    const parsedBody = JSON.parse(body);
                    const productID = parsedBody.productID;

                    // Retrieve the user's email
                    const email = await getEmail(req);

                    // Check if user is logged in
                    if (email === -1) {
                        return { code: 401, hdrs: {"Content-Type": "application/json"}, body: JSON.stringify({ error: "User not logged in" }) };
                    }

                    // Delete review based on productID and user's email
                    const deleteResult = await deleteReview(productID, email);

                    // Handle the result of review deletion
                    if (deleteResult.success) {
                        // Return success response
                        return { code: 200, hdrs: {"Content-Type": "application/json"}, body: JSON.stringify({ message: "Review deleted successfully" }) };
                    } else {
                        // Return error response
                        return { code: 404, hdrs: {"Content-Type": "application/json"}, body: JSON.stringify({ error: "Review not found or user does not have permission to delete" }) };
                    }
                } catch (error) {
                    // Return error response if parsing body fails
                    return { code: 400, hdrs: {"Content-Type": "application/json"}, body: JSON.stringify({ error: "Invalid request body" }) };
                }
            } else {
                // Return empty response for unsupported DELETE requests
                return {};
            }

    }
    
} 

async function shoppingCart(req, body, urlParts) {
    switch(req.method) {
        case 'GET':
            return await viewShoppingCart(req);
        case 'POST':
            let userEmail = await getEmail(req);
            if (userEmail instanceof Error || userEmail === -1) {
                return userEmail instanceof Error ? failedDB() : { code: 401, hdrs: { "Content-Type": "text/html" }, body: "Unauthorized: Please login to view or modify the shopping cart." };
            }
            if (urlParts[1] === 'products') {
                return await handleAddProductToCart(req, userEmail, body);
            } 
            return {};
        case 'DELETE':
            if (urlParts[1] === 'products' && urlParts[2]) {
                let userEmail = await getEmail(req);
                if (userEmail instanceof Error || userEmail === -1) {
                    return userEmail instanceof Error ? failedDB() : { code: 401, hdrs: { "Content-Type": "text/html" }, body: "Unauthorized: Please login to view or modify the shopping cart." };
                } else {
                    // Assuming userEmail is valid, handle product removal
                    return await removeProductFromCart(userEmail, urlParts[2]);
                }
            } else {
                return {};
            }

    }
}

async function orders(req, body, urlParts) {
    switch(req.method) {
        case 'GET':
            if(!urlParts[1])
                return await viewOrders(req, body, urlParts);
            else
                return {};
        case 'POST':
            return await makeOrder(req, body, urlParts);
        default:
            return {};
    }
}

// Implementation for deleteReview function
async function deleteReview(productID, email) {
    try {
        // Attempt to delete the review based on productID and email
        await dBCon.promise().query('DELETE FROM productreviews WHERE product_ID = ? AND email = ?', [productID, email]);

        // Check if the review was successfully deleted
        const result = await dBCon.promise().query('SELECT * FROM productreviews WHERE product_ID = ? AND email = ?', [productID, email]);
        if (result[0].length === 0) {
            return { success: true }; // Return success response
        } else {
            return { success: false, error: "Review not found or not authorized to delete" }; // Return error response
        }
    } catch (error) {
        console.error('Error during review deletion:', error);
        return { success: false, error: 'Internal server error' }; // Return error response
    }
}
//

async function viewOrders(req, body, urlParts) {
    let resMsg = {};
    let user_ID = await getEmail(req); 
    let query = "select * from orders where email = '" + user_ID + "'";
    const getOrderHistory = async() => {
        let resMsg = {};
        await dBCon.promise().query(query).then(([ result ]) => {
            if (result[0]) {
                resMsg.code = 200;
                resMsg.hdrs = {"Content-Type" : "application/json"};
                resMsg.body = JSON.stringify(result);
            }
        }).catch(error => {
            resMsg = failedDB();
        });
        return resMsg;
    }
    return await getOrderHistory();
}

async function viewShoppingCart(req) {
    let resMsg = { hdrs: {"Content-Type": "application/json"} };
    let userEmail = await getEmail(req);
    if (userEmail instanceof Error) {
        return failedDB();
    }

    try {
        const [cartItems] = await dBCon.promise().query(
            `SELECT p.product_ID, p.name, scp.quantity, p.price 
             FROM shoppingcartproducts scp
             JOIN products p ON scp.product_ID = p.product_ID
             WHERE scp.email = ?`, [userEmail]
        );

        if (cartItems.length === 0) {
            // No items in the cart
            resMsg.code = 200;
            resMsg.body = JSON.stringify({ message: "Your shopping cart is empty." });
        } else {
            // Calculate total cost
            const totalCost = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            
            resMsg.code = 200;
            resMsg.body = JSON.stringify({ items: cartItems, totalCost: totalCost });
        }
    } catch (error) {
        console.error('Error fetching shopping cart:', error);
        resMsg.code = 500;
        resMsg.body = JSON.stringify({ message: "Internal server error. Could not fetch shopping cart." });
    }

    return resMsg;
}
async function removeProductFromCart(userEmail, productID) {
    const [exists] = await dBCon.promise().query(
        'SELECT quantity FROM shoppingcartproducts WHERE email = ? AND product_ID = ?', 
        [userEmail, productID]
    );
    
    if (exists.length === 0) {
        // Product not found in the user's cart
        return {
            code: 404,
            hdrs: { "Content-Type": "text/html" },
            body: "Product not found in cart."
        };
    }

    // Proceed with deletion
    await dBCon.promise().query(
        'DELETE FROM shoppingcartproducts WHERE email = ? AND product_ID = ?', 
        [userEmail, productID]
    );
    
    // TODO: Update the total cost in the shoppingcarts table here
    
    return {
        code: 200,
        hdrs: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "Product removed from the cart successfully." })
    };
}


async function handleAddProductToCart(req, userEmail, body) {
    let productDetails;
    try {
        productDetails = JSON.parse(body);
    } catch (error) {
        return { code: 400, hdrs: {"Content-Type": "application/json"}, body: JSON.stringify({ message: "Bad request. Please check your input." }) };
    }

    // Basic validation
    if (!productDetails.product_ID || productDetails.quantity <= 0) {
        return { code: 400, hdrs: {"Content-Type": "application/json"}, body: JSON.stringify({ message: "Invalid product details." }) };
    }

    let resMsg = { hdrs: {"Content-Type": "application/json"} };

    try {
        // Use helper function to verify product availability
        const availability = await verifyProductAvailability(productDetails.product_ID);
        if (!availability.exists || !availability.available) {
            resMsg.code = availability.exists ? 409 : 404;
            resMsg.body = JSON.stringify({ message: availability.exists ? "Insufficient stock." : "Product does not exist." });
            return resMsg;
        }
        const cartStatus = await checkCartQuantity(userEmail);
        if (cartStatus.error) {
            resMsg.code = 500;
            resMsg.body = JSON.stringify({ message: "Error checking cart quantity." });
            return resMsg;
        }

        // Add or updating product in the cart based on helpers' outcomes
        const updateCartResponse = await updateCartWithProduct(userEmail, productDetails.product_ID, productDetails.quantity, availability.stock);
        if (!updateCartResponse.success) {
            throw new Error(updateCartResponse.message); // Or handle more gracefully
        }

        resMsg.code = 200;
        resMsg.body = JSON.stringify({ message: "Product added to shopping cart successfully." });
        
        return resMsg;
    } catch (error) {
        console.error(error);
        resMsg.code = 500;
        resMsg.body = JSON.stringify({ message: "Internal server error." });
        return resMsg;
    }
}


async function updateCartWithProduct(userEmail, productID, quantityToAdd) {
    try {
        await dBCon.promise().beginTransaction();

        // Ensure the user has a shopping cart, create if not exists
        const [cartExists] = await dBCon.promise().query(
            'SELECT cost FROM shoppingcarts WHERE email = ?', 
            [userEmail]
        );
        if (cartExists.length === 0) {
            // No existing cart, create a new one with initial cost of 0
            await dBCon.promise().query(
                'INSERT INTO shoppingcarts (email, cost) VALUES (?, 0)',
                [userEmail]
            );
        }

        // Check if the product already exists in the user's cart
        const [existing] = await dBCon.promise().query(
            'SELECT quantity FROM shoppingcartproducts WHERE email = ? AND product_ID = ?', 
            [userEmail, productID]
        );

        if (existing.length > 0) {
            // Product exists, update its quantity
            const newQuantity = existing[0].quantity + quantityToAdd;
            await dBCon.promise().query(
                'UPDATE shoppingcartproducts SET quantity = ? WHERE email = ? AND product_ID = ?', 
                [newQuantity, userEmail, productID]
            );
        } else {
            // New product, insert it into the cart
            await dBCon.promise().query(
                'INSERT INTO shoppingcartproducts (email, product_ID, quantity) VALUES (?, ?, ?)', 
                [userEmail, productID, quantityToAdd]
            );
        }

        // Fetch the current product's price
        const [productInfo] = await dBCon.promise().query(
            'SELECT price FROM products WHERE product_ID = ?', 
            [productID]
        );
        if (productInfo.length === 0) {
            throw new Error('Product not found.');
        }
        const productPrice = productInfo[0].price;
        const costIncrease = productPrice * quantityToAdd;

        // Update the total cost in the shopping cart
        await dBCon.promise().query(
            'UPDATE shoppingcarts SET cost = cost + ? WHERE email = ?', 
            [costIncrease, userEmail]
        );

        await dBCon.promise().commit();
        return { success: true, message: "Cart updated successfully." };
    } catch (error) {
        await dBCon.promise().rollback();
        console.error('Transaction failed:', error);
        return { success: false, message: "Failed to update the cart." };
    }
}

async function getUserID(req) {  // returns error if error, returns -1 if not logged in, returns userID if logged in
    let cookies = parseCookies(req);
    if (cookies.hasOwnProperty("user_ID")) {
        let user_ID = cookies.user_ID;
        let validID;
        validID = await verify(user_ID).catch(validID = Error);
        if (validID instanceof Error)
            return validID;
        else if (validID != -1) {
            return user_ID;
        }
    }
    return -1;
}

async function getEmail(req) { // returns error if error, returns -1 if not logged in, returns email if logged in
    let cookies = parseCookies(req);
    if (cookies.hasOwnProperty("user_ID")) {
        let user_ID = cookies.user_ID;
        let validID;
        validID = await verify(user_ID).catch(validID = Error);
        return validID;
    }
    return -1;
}

function roundPrice(num) {
    return Math.ceil(num * 100) / 100;
}

async function makeOrder(req, body, urlParts) {
    let resMsg = {};
    
    let user_ID = getEmail(req);
    const queries = [
        "select * from shoppingcarts where user_ID = '" + user_ID + "'",
        "select * from shoppingcartproducts where user_ID = '" + user_ID + "'",
        "select * from products join shoppingcartproducts on products.product_ID = shoppingcartproducts.product_ID where shoppingcartproducts.user_ID = '" + user_ID + "'",
      ];
    const results = []; //results format = [[{shoppingcartproducts of user}], [{cartInf0}], [{product info}]];
    for(let i = 0; i < queries.length; i++) {
        try {
            // Execute SQL queries asynchronously
            let temp = await executeQueries(queries[i]);
            results.push(temp);
        } catch (error) {
            resMsg.code = 200;
            resMsg.writeHead(500, { 'Content-Type': 'text/plain' });
            resMsg.end(`Error executing queries: ${error.message}`);
        }
    }
    let discounted_price = await applyDiscounts(results);
    let result = await createOrder(req, body, results, discounted_price);
   
   
    await insertOrder(result);
    if(insertOrder) {
        resMsg.code = 200;
        resMsg.hdrs = {"Content-Type" : "text/html"};
        resMsg.body = "successfully placed order :D\norder_ID: " + result.order_ID; 
        return resMsg;
    }
    return;
}

async function applyDiscounts(orderInfoArray) {
    let discounted_price = 0;
    for(let i = 0; i < orderInfoArray[2].length; i++) {
       let new_price = await getDiscounts(orderInfoArray[2][i].product_ID, orderInfoArray[2][i].cost);
       discounted_price += new_price[0];
    }
    discounted_price = parseInt("FF", 16);
    return  discounted_price;
}

async function executeQueries(query) {
    return new Promise((resolve, reject) => {
        dBCon.query(query, (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result);
        });
    });
}

async function insertOrder(order) {
    let body = "";
    const orderAttributes = "(order_ID, user_ID, date_made, payment_method, products_cost, tax_cost, shipping_cost, delivery_address, billing_address, status)";
    let orderValues = `(${order.order_ID}, '${order.user_ID}', '${order.date_made}', '${order.payment_method}', ${order.products_cost}, ${order.tax_cost}, ${order.shipping_cost}, '${order.delivery_address}', '${order.billing_address}', '${order.status}')`;
    let query = "insert into orders " + orderAttributes + " values "  + orderValues;
    return new Promise((resolve, reject) => {
        dBCon.query(query, (err, result) => {
            if (err) {
                reject(err);
                return body;
            }
            resolve(result);
        });
    });
    
}
async function postReview(req, requestBody) {
    let reviewData;
    try {
        reviewData = JSON.parse(requestBody);
    } catch (error) {
        return {
            code: 400,
            hdrs: {"Content-Type": "text/html"},
            body: "Invalid request body - JSON parsing failed."
        };
    }

    // Ensure that reviewData contains email, product_ID, score, description, and created fields
    // The 'created' field will need to be generated here, as an example:
    const created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const insertQuery = "INSERT INTO productreviews (product_ID, email, score, description, created) VALUES (?, ?, ?, ?, ?)";

    try {
        const [result] = await dBCon.promise().execute(insertQuery, [reviewData.product_ID, reviewData.email, reviewData.score, reviewData.review_text, created]);

        if (result.affectedRows > 0) {
            return {
                code: 200,
                hdrs: {"Content-Type": "text/html"},
                body: "Review successfully posted."
            };
        } else {
            return {
                code: 500,
                hdrs: {"Content-Type": "text/html"},
                body: "Failed to post review for an unknown reason."
            };
        }
    } catch (error) {
        console.error(error);
        return failed(); // Make sure the failed() function correctly reflects this context
    }
}
