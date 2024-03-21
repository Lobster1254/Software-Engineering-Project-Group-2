const fs = require('fs');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});
let dBCon;

// Prompt for database password and establish connection
readline.question('Enter password: ', pass => {
    const mysql = require("mysql2");
    dBCon = mysql.createConnection({
        host: "localhost",
        user: "root",
        database: "lifesynchub",
        password: pass
    });
    dBCon.connect(function(err) {
        if (err) throw err;
        console.log("Connected to the database.");
        promptDeleteReview();
    });
});

// Function to prompt for review ID and delete the review
function promptDeleteReview() {
    readline.question('Enter review ID to delete: ', reviewID => {
        deleteReview(reviewID).then(() => {
            console.log("Review deleted successfully.");
            readline.close(); // Close the readline interface after deletion
        }).catch(error => {
            console.error("An error occurred:", error.message);
            readline.close(); // Ensure readline interface is closed on error
        });
    });
}

// Async function to delete a review by ID
async function deleteReview(reviewID) {
    try {
        const query = "DELETE FROM ProductReviews WHERE review_ID = ?";
        const [result] = await dBCon.promise().query(query, [reviewID]);
        if (result.affectedRows === 0) {
            throw new Error("Review not found or already deleted.");
        }
    } catch (error) {
        throw error; // Rethrow the error to be caught in the calling function
    }
}
