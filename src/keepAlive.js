var http = require('http');

function keepAlive() {
    http.createServer(function (req, res) {
        res.write("I'm alive");
        res.end();
    }).listen(80, () => {
        console.log("Keep-alive server is running on port 80.");
    });
}

module.exports = keepAlive;