require('dotenv').config()

const fs = require('fs');
const https = require('https')
const app = require('express')();
const bodyParser = require("body-parser");
const cors = require("cors");

const hostname = 'neilpatricklacson.online';
const httpsPort = 443;

const httpsOptions = {
    cert: fs.readFileSync('cert/neilpatricklacson_online.crt'),
    ca: fs.readFileSync('cert/neilpatricklacson_online.ca-bundle'),
    key: fs.readFileSync('cert/reidata.key')
}

const httpsServer = https.createServer(httpsOptions, app);

const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

app.use(cors());

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.status(200).json({
        message: `REIDATA`
    });
});

app.post("/reidata/send-message", async(req, res) => {
    console.log(req.params);
    try {
        let response = await client.messages.create({
            body: req.body.message,
            from: process.env.TWILIO_NUMBER,
            to: req.body.to
        })

        res.status(200).json({
                response: response,
                message: `Message Sent To ${req.body.to}`
        })
    } catch (err) {
        res.status(500).json({
            Error: err.message,
            result: req.body.message
        })
    }
});

app.get('/twilio/get-messages', async(req, res) => {
    console.log(res);
    try {
        let request = await client.messages.list({limit : 20})

        res.status(200).json({
            response: request,
            message: `Messages has been retrieved`
        });
    } catch (err) {
        res.status(500).json({
            Error: err.message,
        })
    }
});

app.post('/twilio/lookup-message', async(req, res) => {
    try {
        let response = await client.lookups.phoneNumbers(req.body.phoneNumber).fetch({
            type: ['carrier']
        });

        res.status(200).json({
            response: response,
        });
    }
    catch (err) {
        res.status(500).json({
            Error: err.message
        });
    }
});

httpsServer.listen(httpsPort, hostname);