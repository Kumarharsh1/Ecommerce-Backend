const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Orders route working' });
});

module.exports = router;