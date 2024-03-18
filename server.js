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
                            resMsg = await productCatalog(req, res, urlParts);
                            break;
                        case 'product-reviews':
                            resMsg = await productReviews(req, res, urlParts);
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

function failedDB() {
    resMsg = {};
    resMsg.code = 503;
    resMsg.hdrs = {"Content-Type" : "text/html"};
    resMsg.body = "Failed access to database. Please try again later.";
    return resMsg;
}

async function productCatalog(req, res, urlParts) {
    let resMsg = {};
    if (urlParts[1]) {
        let product_ID = urlParts[1];
        let productQuery = "select * from products where product_ID = '" + product_ID + "'";
        let reviewQuery = "select user_ID, score, description, created from productreviews where product_ID = '" + product_ID + "'";
        let discountQuery = "select d.* from discounts d, discountedproducts p where ((d.discount_ID = p.discount_ID and p.product_ID = '" + product_ID + "' and d.scope = 'product_list') or (d.category = (select category from products where product_ID = '" + product_ID + "') and d.scope = 'category')) and d.end_date >= CURDATE()";
        let user_ID = getUserID();
        let ordersQuery = "select o.order_ID, o.date_made, p.quantity, o.status from orders o, orderproducts p where o.order_ID = p.order_ID and user_ID = '" + user_ID + "' and p.product_ID = '" + product_ID + "'";
        const getProductInfo = async() => {
            let resMsg = {};
            await dBCon.promise().query(productQuery).then(([ result ]) => {
                if (result[0]) {
                    resMsg.body = result[0];
                }
            }).catch(error => {
                resMsg = failedDB();
            });
            await dBCon.promise().query(discountQuery).then(([ result ]) => {
                if (result[0]) {
                    let set_price = resMsg.body.price;
                    let lowered_price = resMsg.body.price;
                    for (i = 0; i < result.length; i++) {
                        if (result[i].type == "set_price") {
                            if (result[i].set_price != null && result[i].set_price < set_price)
                                set_price = result[i].set_price;
                        } else {
                            if (result[i].percent_off != null && result[i].percent_off <= 100 && result[i].percent_off > 0)
                                lowered_price = lowered_price * (100-result[i].percent_off)/100;
                        }
                    }
                    if (set_price < resMsg.body.price) 
                        resMsg.body.discounted_price = set_price;
                    else 
                        resMsg.body.discounted_price = lowered_price;
                    resMsg.body.discounted_price = roundPrice(resMsg.body.discounted_price);
                    resMsg.body.discounts = result;
                }
            }).catch(error => {
                resMsg.body.discounts = "Failed to load discounts.";
                console.log(error);
            });
            await dBCon.promise().query(ordersQuery).then(([ result ]) => {
                if (result[0]) {
                    resMsg.body.orders = result;
                }
            }).catch(error => {
                resMsg.body.reviews = "Failed to load orders.";
                console.log(error);
            });
            await dBCon.promise().query(reviewQuery).then(([ result ]) => {
                if (result[0]) {
                    let sum = 0;
                    for (i = 0; i < result.length; i++)
                        sum = sum + result[i].score;
                    resMsg.body.average_rating = sum/result.length;
                    resMsg.body.reviews = result;
                }
            }).catch(error => {
                resMsg.body.reviews = "Failed to load reviews.";
            });
            resMsg.code = 200;
            resMsg.hdrs = {"Content-Type" : "application/json"};
            resMsg.body = JSON.stringify(resMsg.body);
            return resMsg;
        }
        return getProductInfo();
    } else {
        return resMsg;
    }
    
}

async function productReviews(req, res, urlParts) {
    let resMsg = {};
    resMsg.code = 200;
    resMsg.hdrs = {"Content-Type" : "text/html"};
    resMsg.body = "reviews";
    return resMsg;
} 

function getUserID() {
    // idk
    return -1;
}

function roundPrice(num) {
    return Math.ceil(num * 100) / 100;
}