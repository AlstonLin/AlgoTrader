var router = require('express').Router();


router.get("/testapi", function (req, res) {
	res.send("test api successful")
})

module.exports = router