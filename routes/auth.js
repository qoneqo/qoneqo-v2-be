const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../services/auth');
const apps = require('../services/app/apps');

const tokenAge = 60 * 1000;
const tokenMaxAge = 1000 * tokenAge;
const tokenSign = (user) => ({
  // iat: 'value setted by default libs',
  exp: Math.floor(Date.now() / 1000) + tokenAge,
  nbf: Math.floor(Date.now() / 1000),
  id: user?.id,
  app_id: user?.app_id,
  // iss: '',
  // aud: '',
});

const tokenResetAge = 60 * 5;
const tokenResetMaxAge = 1000 * tokenResetAge;
const tokenResetSign = (user, token) => ({
  // iat: 'value setted by default libs',
  exp: Math.floor(Date.now() / 1000) + tokenResetAge,
  nbf: Math.floor(Date.now() / 1000),
  id: user?.id,
  app_id: user?.app_id,
  token,
  // iss: '',
  // aud: '',
});

router.post('/logout', (req, res, next) => {
  res.clearCookie('_token').clearCookie('_token_reset').clearCookie('_filter').sendStatus(200);
})

router.post('/reset', async (req, res, next) => {
  if (!req.cookies._token_reset) return res.sendStatus(403);
  jwt.verify(req.cookies._token_reset, process.env.JWT_SECRET_RESET, async (err, decoded) => {
    if (err) { 
      return res.clearCookie('_token').clearCookie('_token_reset').clearCookie('_filter').sendStatus(403); 
    }
    app_id = (await apps.index({userId: decoded.id})).map((val) => val.id);

    const user = { id: decoded.id, app_id };
    const token = jwt.sign(tokenSign(user), process.env.JWT_SECRET);
    const tokenReset = jwt.sign(tokenResetSign(user, token), process.env.JWT_SECRET_RESET);
    
    res.cookie('_token', token, {
      maxAge: tokenMaxAge,
      httpOnly: true,
    }).cookie('_token_reset', tokenReset, {
      maxAge: tokenResetMaxAge,
      httpOnly: true,
    })
    .sendStatus(200);

  })
})

router.post('/login', async (req, res, next) => {
  let user = null;
  
  try {
    user = await auth.login(req.body.identifier);
    if (!user?.password) return res.status(403).json('No user found');
  } catch (error) {
    return res.sendStatus(500);
  }
  
  if(!await bcrypt.compare(req.body.password, user.password)) return res.status(403).json('Cred fail');
  app_id = (await apps.index({userId: user.id})).map((val) => val.id);
  delete user.password;
  user = {...user, app_id};
  const token = jwt.sign(tokenSign(user), process.env.JWT_SECRET);
  const tokenReset = jwt.sign(tokenResetSign(user, token), process.env.JWT_SECRET_RESET);


  res.cookie('_token', token, {
    maxAge: tokenMaxAge,
    httpOnly: true,
  }).cookie('_token_reset', tokenReset, {
    maxAge: tokenResetMaxAge,
    httpOnly: true,
  })
  .json(user);

});

module.exports = router;
