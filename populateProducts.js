const fs = require('fs');

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});
let dBCon;
readline.question('Enter password: ', pass => { // read password
    const mysql = require("mysql2");
    dBCon = mysql.createConnection({ // MySQL database
        host: "localhost",
        user: "root",
        database: "lifesynchub",
        password: pass
    });
    dBCon.connect(function(err) { if (err) throw err; });
    console.log("Connected.");
    loadProducts("tablet");
    loadProducts("camera");
});

async function loadProducts(productType) {
    let products;
    try {
        products = fs.readFileSync(productType + 's.json', 'utf8');
    } catch (error) {
        throw error;
    }
    products = JSON.parse(products);
    let count = 0;
    for (let i = 0; i < products.category_results.length; i++) {
        let product_ID = products.category_results[i].product.product_id;
        let name = products.category_results[i].product.title;
        name = name.replaceAll("'", "\\'");
        let description;
        if (products.category_results[i].product.description) {
            description = products.category_results[i].product.description;
            description = description.replaceAll("'", "\\'");
        } else
            description = null;
        let stock
        if (products.category_results[i].inventory.in_stock)
            stock = Math.floor(Math.random() * 99 + 1);
        else
            stock = 0;
        let price = products.category_results[i].offers.primary.price;
        let height_in = Math.floor(Math.random() * 2 + 1);
        let width_in = Math.floor(Math.random() * 24 + 1);
        let length_in = Math.floor(Math.random() * 24 + 1);
        let category = productType;
        let weight_oz = Math.floor(Math.random() * 30 + 1);
        query = "replace into products (product_ID, name, description, stock, price, height_in, width_in, length_in, category, weight_oz) values ('"
            + product_ID + "', '" + name + "', '" + description + "', '" + stock + "', '" + price + "', '" + height_in + "', '" + width_in + "', '"
            + length_in + "', '" + category + "', '" + weight_oz + "');";
        await dBCon.promise().query(query).then(([ result ]) => {
            console.log("Added product " + product_ID + ".");
        }).catch(error => {
            console.log(error);
        });
    }   
}