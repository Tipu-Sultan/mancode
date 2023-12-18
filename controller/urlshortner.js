const shortid = require('shortid');
const URL = require('../models/urlshortner');
require('dotenv').config();

async function postUrlShortner(req, res) {
    const { originalUrl } = req.body;
    const HOST = process.env.API_HOST || 'http://localhost:8080'

    try {
        // Check if the URL already exists in the database
        const existingUrl = await URL.findOne({ originalUrl });

        if (existingUrl) {
            // Generate a new short ID using shortid
            const newShortUrl = shortid.generate();
            const actualUrl = `${HOST}/` + newShortUrl;

            // Update the existing document with the new shortUrl
            existingUrl.shortUrl = newShortUrl;
            await existingUrl.save();

            res.status(200).json({ actualUrl, msg: 'success' });
        } else {
            // If the originalUrl doesn't exist, create a new entry
            const shortUrl = shortid.generate();
            const actualUrl = `${HOST}/` + shortUrl;

            // Create a new URL entry in the database
            const newUrl = new URL({ originalUrl, shortUrl });
            await newUrl.save();

            res.status(200).json({ actualUrl, msg: 'success' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function redirectToUrl(req, res) {
    try {
        const { shortUrl } = req.params;

        // Find the URL in the database based on the short URL
        const redirect = await URL.findOne({ shortUrl });

        if (redirect) {
            // Redirect to the original URL
            res.redirect(redirect.originalUrl);
        } else {
            // If the short URL is not found, send a 404 Not Found response
            res.status(404).json({ error: 'URL not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}




module.exports = {
    postUrlShortner,
    redirectToUrl
}