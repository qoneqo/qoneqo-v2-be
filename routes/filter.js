const express = require('express');
const router = express.Router();

router.get('/get-filter', async(req, res, next) => {
  res.json({app_list_selected: (req.cookies._filter?.app_list_selected || 0)});
})

router.post('/set-filter', async(req, res, next) => {
  res.cookie('_filter', {app_list_selected: req.body.app_list_selected}, {
    httpOnly: true,
  }).sendStatus(200);
})
module.exports = router;
