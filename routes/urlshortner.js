const express = require("express");
const { postUrlShortner, redirectToUrl } = require("../controller/urlshortner");
const router = express.Router();

router.post('/',postUrlShortner)
router.get('/:shortUrl',redirectToUrl)

module.exports = router
