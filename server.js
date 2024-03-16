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
        let query = "select * from products where product_ID = '" + product_ID + "'";
        const getProductInfo = async() => {
            let resMsg = {};
            await dBCon.promise().query(query).then(([ result ]) => {
                if (result[0]) {
                    resMsg.code = 200;
                    resMsg.hdrs = {"Content-Type" : "application/json"};
                    resMsg.body = JSON.stringify(result[0]);
                }
            }).catch(error => {
                resMsg = failedDB();
            });
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

