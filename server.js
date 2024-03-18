const http = require('http');
const fs = require('fs');
const port = 8000;
let dBCon = {};
let html;

try {
    html = fs.readFileSync('lifesynchub.html', 'utf8');
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
    for (i = 0, num = segments.length; i < num; i++) {
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
                            resMsg = await productCatalog(urlParts);
                            break;
                        case 'product-reviews':
                            resMsg = await productReviews(urlParts);
                            break;
                        default:
                            break;
                    }
                } else {
                    resMsg.code = 200;
                    resMsg.hdrs = {"Content-Type" : "text/html"};
                    resMsg.body = html;
                }
                break;
            case 'POST':
                resMsg.code = 200;
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

server.once('error', function(err) {
    if (err.code === 'EADDRINUSE') {
      console.log('Port ' + port + ' is already in use. Please kill all processes associated with this port before launching this server.');
      process.exit();
    }
});

const getProductReviews = async(product_ID) => { // returns array, index 0 = avg rating, index 1 = JSON of reviews
    let reviewInfo = [];
    let reviewQuery = "select user_ID, score, description, created from productreviews where product_ID = '" + product_ID + "'";
    await dBCon.promise().query(reviewQuery).then(([ result ]) => {
        if (result[0]) {
            let sum = 0;
            for (i = 0; i < result.length; i++)
                sum = sum + result[i].score;
            reviewInfo[0] = sum/result.length;
            reviewInfo[1] = result;
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
            for (i = 0; i < result.length; i++) {
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

const getProductInfo = async(product_ID) => { // returns stringified JSON of product info
    let productQuery = "select * from products where product_ID = '" + product_ID + "'";
    let user_ID = getUserID();
    let ordersQuery = "select o.order_ID, o.date_made, p.quantity, o.status from orders o, orderproducts p where o.order_ID = p.order_ID and user_ID = '" + user_ID + "' and p.product_ID = '" + product_ID + "'";
    let resMsg = {};
    let isProduct = true;
    foundProduct = true;
    await dBCon.promise().query(productQuery).then(([ result ]) => {
        if (result[0]) {
            resMsg.body = result[0];
        } else {
            isProduct = false;
        }
    }).catch(error => {
        foundProduct = false;
        resMsg = failedDB();
    });
    if (!isProduct || !foundProduct)
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
    await dBCon.promise().query(ordersQuery).then(([ result ]) => {
        if (result[0]) {
            resMsg.body.orders = result;
        }
    }).catch(error => {
        resMsg.body.reviews = "Failed to load orders.";
    });
    let reviewInfo = await getProductReviews(product_ID);
    if (reviewInfo) {
        if (reviewInfo instanceof String) {
            resMsg.body.reviews = reviewInfo;
        } else {
            resMsg.body.average_rating = reviewInfo[0];
            resMsg.body.reviews = reviewInfo[1];
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
    resMsg.body = "Failed access to database. Please try again later.";
    return resMsg;
}

async function searchProducts(keyword) {
    resMsg = {};
    let searchQuery = "select * from products where match(name, description, category) against('" + keyword + "');";
    await dBCon.promise().query(searchQuery).then(([ result ]) => {
        resMsg.code = 200;
        resMsg.hdrs = {"Content-Type" : "application/json"};
        resMsg.body = result;
    }).catch(error => {
        resMsg = failedDB();
    });
    resMsg.body = JSON.stringify(resMsg.body);
    return resMsg;
}

async function productCatalog(urlParts) {
    if (urlParts[1]) {
        if (urlParts[1].startsWith("search?key=")) {
            let keyword = urlParts[1].split("=")[1];
            return await searchProducts(keyword);
        } else {
            let product_ID = urlParts[1];
        
            return await getProductInfo(product_ID);
        }
    } else {
        return {};
    }
    
}


async function productReviews(urlParts) {
    if (urlParts[1]) {
        let resMsg = {};
        let product_ID = urlParts[1];
        let isProduct = true;
        let foundProduct = true;
        await dBCon.promise().query("select product_ID from products where product_ID = '" + product_ID + "'").then(([ result ]) => {
            if (!result[0])
                isProduct = false;
        }).catch(error => {
            foundProduct = false;
            resMsg = failedDB();
        });
        if (!isProduct || !foundProduct)
            return resMsg;
        let reviewInfo = await getProductReviews(product_ID);
        if (reviewInfo) {
            if (reviewInfo instanceof String) {
                return failedDB();
            } else {
                resMsg.body = {};
                resMsg.body.average_rating = reviewInfo[0];
                resMsg.body.reviews = reviewInfo[1];
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

function getUserID() {
    // idk
    return -1;
}

function roundPrice(num) {
    return Math.ceil(num * 100) / 100;
}