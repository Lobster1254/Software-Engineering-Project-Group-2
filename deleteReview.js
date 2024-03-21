const http = require('http');
const url = require('url');
const mysql = require('mysql2');

const port = 8000;
let dBCon;

(async () => {
    dBCon = await mysql.createConnection({
        host: "localhost",
        user: "root",
        database: "lifesynchub",
        password: pass
    });
})();

const server = http.createServer(async (req, res) => {
    const reqUrl = url.parse(req.url, true);
    // Assuming deletion request is sent to /delete-review with a POST method
    if (req.method === 'POST' && reqUrl.pathname === '/delete-review') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString(); // Convert Buffer to string
        });
        req.on('end', async () => {
            try {
                const { reviewID, userID } = JSON.parse(body);
                // Authenticate user here. For now, let's assume userID is enough
                const [reviews] = await dBCon.execute('SELECT * FROM ProductReviews WHERE review_ID = ? AND user_ID = ?', [reviewID, userID]);
                if (reviews.length === 0) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Review not found or you are not authorized to delete this review.' }));
                    return;
                }
                await dBCon.execute('DELETE FROM ProductReviews WHERE review_ID = ?', [reviewID]);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Review deleted successfully.' }));
            } catch (error) {
                console.error(error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal Server Error' }));
            }
        });
    }
});

server.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
