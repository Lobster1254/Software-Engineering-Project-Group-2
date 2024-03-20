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
      body += data;
      if (body.length > 1e6) {
        res.writeHead(413); // 413 payload too large
        res.write("Payload too large.");
        res.end();
        req.destroy();
      }
    });
    req.on('end', async function () {
        switch(req.method) {
            case 'GET':
                if (urlParts[0]) {
                    switch(urlParts[0]) {
                        case 'product-catalog':
                            resMsg = await productCatalog(req, body, urlParts);
                            break;
                        case 'product-reviews':
                            resMsg = await productReviews(req, body, urlParts);
                            break;
                        case 'view-orders':
                            resMsg = await viewOrders(urlParts);
                            break;
                        default:
                            break;
                    }
                } else {
                    let user_ID = await getUserID(req);
                    if (user_ID instanceof Error)
                        resMsg = failed();
                    else if (user_ID == -1) {
                        resMsg.code = 200;
                        resMsg.hdrs = {"Content-Type" : "text/html"};
                        resMsg.body = loginhtml;
                    } else {
                        resMsg.code = 200;
                        resMsg.hdrs = {"Content-Type" : "text/html"};
                        resMsg.body = logouthtml;
                    }
                }
                break;
            case 'POST':
                if (urlParts[0]) {
                    switch(urlParts[0]) {
                        case 'login':
                            let validID;
                            validID = await verify(body).catch(validID = Error);
                            if (validID instanceof Error) {
                                return failed();
                            } else if (validID != -1) {
                                resMsg.code = 200;
                                resMsg.hdrs = {"Content-Type" : "text/html", "Set-Cookie":"user_ID=" + body + "; HttpOnly"};
                            }
                            break;
                        case 'logout':
                            resMsg.code = 200;
                            resMsg.hdrs = {"Content-Type" : "text/html", "Set-Cookie": "user_ID=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"};
                            break;
                        default:
                            break;
                    }
                  }
                break;
            default:
                break;
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
    let reviewQuery = "select r.*, IFNULL(2*sum(h.rating)-count(h.rating), 0) helpfulness from productreviews r left join helpfulnessratings h on r.user_ID = h.review_user_ID and r.product_ID = h.product_ID where r.product_ID = '" + product_ID + "'group by user_ID, product_ID";
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
    let discountQuery = "select d.* from discounts d, discountedproducts p where ((d.discount_ID = p.discount_ID and p.product_ID = '" + product_ID + "' and d.scope = 'product_list') or (d.category = (select category from products where product_ID = '" + product_ID + "') and d.scope = 'category')) and d.end_date >= CURDATE()";
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
    if (email instanceof Error)
        return failed();
    let ordersQuery = "select o.order_ID, o.date_made, p.quantity, o.status from orders o, orderproducts p where o.order_ID = p.order_ID and user_ID = '" + email + "' and p.product_ID = '" + product_ID + "'";
    let resMsg = {};
    let isProduct = true;
    await dBCon.promise().query(productQuery).then(([ result ]) => {
        if (result[0]) {
            resMsg.body = result[0];
        } else {
            isProduct = false;
        }
    }).catch(error => {
        return failed();
    });
    if (!isProduct)
        return resMsg;
    let discounts = await getDiscounts(product_ID, resMsg.body.price);
    if (discounts) {
        if (discounts instanceof String) {
            resMsg.body.discounts = discounts;
        } else {
            resMsg.body.discounted_price = discounts[0];
            resMsg.body.discounts = discounts[1];
        }
    }
    if (email != -1) {
        await dBCon.promise().query(ordersQuery).then(([ result ]) => {
            if (result[0]) {
                resMsg.body.orders = result;
            }
        }).catch(error => {
            resMsg.body.reviews = "Failed to load orders.";
        });
    }
    let reviewInfo = await getProductReviews(req, body, product_ID);
    if (reviewInfo) {
        if (reviewInfo instanceof String) {
            resMsg.body.reviews = reviewInfo;
        } else if (reviewInfo instanceof Error) {
            resMsg.code = 400;
            resMsg.hdrs = {"Content-Type" : "text/html"};
            resMsg.body = reviewInfo.toString();
            return resMsg;
        } else {
            resMsg.body.average_rating = reviewInfo[0];
            resMsg.body.distribution = reviewInfo[1];
            resMsg.body.reviews = reviewInfo[2];
        }
    }
    resMsg.code = 200;
    resMsg.hdrs = {"Content-Type" : "application/json"};
    resMsg.body = JSON.stringify(resMsg.body);
    return resMsg;
}

function failed() { // can be called when the server fails to connect to an API or the database and that failure is fatal to the use case's function
    resMsg = {};
    resMsg.code = 503;
    resMsg.hdrs = {"Content-Type" : "text/html"};
    resMsg.body = "Failed access to vital service. Please try again later.";
    return resMsg;
}

async function searchProducts(req, body, keyword) {
    resMsg = {};
    let searchQuery = "select p.*, IFNULL(rating.average_rating, 0) average_rating from products p left join (select avg(r.score) average_rating, p.product_ID from products p, productreviews r where p.product_ID = r.product_ID group by p.product_ID) rating on rating.product_ID = p.product_ID where match(name, description, category) against('" + keyword + "')";
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
        if (filters.hasOwnProperty("category")) // filter by category
            searchQuery = searchQuery + " and category = '" + filters.category + "'";
        if (filters.hasOwnProperty("min_price")) // minimum price
            searchQuery = searchQuery + " and price >= '" + filters.min_price + "'";
            min_price = filters.min_price;
        if (filters.hasOwnProperty("max_price")) // maximum price
            searchQuery = searchQuery + " and price <= '" + filters.max_price + "'";
        if (filters.hasOwnProperty("min_rating")) // minimum average review rating
            searchQuery = searchQuery + "and IFNULL(rating.average_rating, 0) >= '" + filters.min_rating + "'";
    }
    await dBCon.promise().query(searchQuery).then(([ result ]) => {
        resMsg.code = 200;
        resMsg.hdrs = {"Content-Type" : "application/json"};
        resMsg.body = result;
        
    }).catch(error => {
        return failed();
    });
    let discountInfo;
    for (let i = 0; i < resMsg.body.length; i++) {
        let currentProduct = resMsg.body[i];
        discountInfo = await getDiscounts(currentProduct.product_ID, currentProduct.price);
        currentProduct.discounted_price = discountInfo[0];
        resMsg.body[i] = currentProduct;
        if (min_price > discountInfo[0])
            if (i == 0) 
                resMsg.body[0] = null;
            else
                for (let i = 1; i < resMsg.body.length; i++)
                    resMsg.body[i] = resMsg.body[i-1];
    }
    resMsg.body = resMsg.body.filter((product) => product != null);
    resMsg.body = JSON.stringify(resMsg.body);
    return resMsg;
}

async function productCatalog(req, body, urlParts) {
    if (urlParts[1]) {
        if (urlParts[1].startsWith("search?")) {
            let param = querystring.decode(urlParts[1].substring(7));
            let keyword;
            if (param.key)
                keyword = param.key;
            else
                return {};
            return await searchProducts(req, body, keyword);
        } else {
            let product_ID = urlParts[1];
            return await getProductInfo(req, body, product_ID);
        }
    } else {
        return {};
    }
    
}


async function productReviews(req, body, urlParts) {
    if (urlParts[1]) {
        let resMsg = {};
        let product_ID = urlParts[1];
        let isProduct = true;
        await dBCon.promise().query("select product_ID from products where product_ID = '" + product_ID + "'").then(([ result ]) => {
            if (!result[0])
                isProduct = false;
        }).catch(error => {
            return failed();
        });
        if (!isProduct)
            return resMsg;
        let reviewInfo = await getProductReviews(req, body, product_ID);
        if (reviewInfo) {
            if (reviewInfo instanceof String) {
                return failed();
            } else if (reviewInfo instanceof Error) {
                resMsg.code = 400;
                resMsg.hdrs = {"Content-Type" : "text/html"};
                resMsg.body = reviewInfo.toString();
                return resMsg;
            } else {
                resMsg.body = {};
                resMsg.body.average_rating = reviewInfo[0];
                resMsg.body.distribution = reviewInfo[1];
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
} 

async function viewOrders(urlParts) {
    let resMsg = {};
    if (urlParts[1]) {
        let user_ID = urlParts[1];
        let query = "select * from orders where user_ID = '" + user_ID + "'";
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
        return getOrderHistory();
    } else {
        return resMsg;
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
