const http = require('http');
const {Client} = require('@elastic/elasticsearch');

const esClient = new Client({
    node: 'http://localhost:9200',
    requestHeaders: {
        'Content-Type': 'application/json'
    }
});

const server = http.createServer(async (req, res) => {
    if (req.url === '/api/products' && req.method === 'GET') {
        try {
            const {body} = await esClient.search({
                index: 'product_catalogue_1',
                size: 100,
                body: {
                    query: {
                        match_all: {}
                    }
                }
            });

            let bodyHitsFirstLevel = body.hits
            let bodyHitsLastLevel = bodyHitsFirstLevel.hits
            let products = bodyHitsLastLevel.map(hit => hit._source);
            products = products[0].data

            let result = {
                "status": "success",
                "status_code": 200,
                "payload": products
            }

            res.writeHead(200, {'Content-Type': 'application/json'});
            res.end(JSON.stringify(result));
        } catch (error) {
            console.error('Error fetching data from Elasticsearch:', error);
            res.writeHead(500, {'Content-Type': 'text/plain'});
            res.end('Internal Server Error');
        }
    } else {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
});

const PORT = 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});