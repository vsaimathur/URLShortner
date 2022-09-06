const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const db = require('./config/config');
const URL = require('./models/urlSchema');
const commonNamesList = require('./dataset/commonNamesList');

//server config
let serverURL;
if(process.env.NODE_ENV == "production") {
    serverURL = 'https:/shorturl.vsaimathur.xyz';
}
else {
    serverURL = 'http://localhost:5000';
}
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cors());

//methods
const isValidURL = (url) => {
    const expression =
        /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    const regex = new RegExp(expression);
    return url.match(regex);
}

const checkNameExistsDB = (commonName) => {
    return new Promise(async (resolve, reject) => {
        try {
            const dbResponse = await URL.find({ shortURL: `${serverURL}/${commonName}` });
            resolve(dbResponse);
        } catch (err) {
            console.log(err);
            reject(err);
        }
    })
}

//routes
app.post('/newURL', async (req, res) => {
    const { url: longURLReceived } = req?.body;
    if (longURLReceived.length && isValidURL(longURLReceived)) {
        let randIndex;
        let dbResponse;
        while (true) {
            randIndex = Math.round(Math.random() * commonNamesList.length);
            dbResponse = await checkNameExistsDB(commonNamesList[randIndex]);
            // console.log(dbResponse);
            if (!dbResponse.length) {
                break;
            }
        }

        //creating entry in DB.
        await URL.create({
            shortURL: `${serverURL}/${commonNamesList[randIndex]}`,
            longURL: `${longURLReceived}`
        })

        //success status
        res.status(200).json({
            status: "success",
            data: { shortURL: `${serverURL}/${commonNamesList[randIndex]}` }
        })
    } else {
        res.status(400).json({
            status: "fail",
            message: "validation on URL Failed"
        })
    }
})

app.get('/:name', async (req, res) => {
    const commonName = req.params.name;
    try {
        const dbResponse = await checkNameExistsDB(commonName);
        if (dbResponse.length) {
            res.redirect(dbResponse[0].longURL);
        } else {
            return res.status(404).json({
                status: "error",
                message: "No Such URL Found"
            })
        }
    } catch (err) {
        console.log(err);
        return res.status(500).json({
            status: "error",
            message: "something went wrong at server side"
        })
    }
})

app.listen(PORT, () => {
    console.log(`Server is listening on PORT ${PORT}...`);
})

