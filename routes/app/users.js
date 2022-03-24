const express = require('express');
const user = require('../../services/app/users');
const bcrypt = require('bcrypt');
const router = express.Router();


/* Get users datatable */
router.get('/datatable', async (req, res, next) => {
  try {
    const data = await user.datatable(req);  
    res.json({
      widget_title: 'List Users',
      widget_data: {
        t_head: {
          id: 'id',
          identifier: 'Username',
          name: 'Name',
          email: 'Email',
          app_name: 'App Name',
          is_active: 'Status',
        },
        t_body: data,
        order_col: ['id', 'identifier', 'name', 'email', 'app_name', 'is_active'],
        total_data: (await user.totalData(req)).total_data,
        base_endpoint: `${process.env.BASE_URL}/users/datatable`,
      }
    })
  } catch (error) {
    console.log(error)
    res.sendStatus(500)
  }
})

/* GET users me */
router.get('/me', async (req, res, next) => {
  res.json(await user.me(req))
});

/**
 * ===========================================================================================
 */

/* GET users index */
router.get('/', async (req, res, next) => {
  res.json(await user.index(req));
});

/* GET users show */
router.get('/:id', async (req, res, next) => {
  try {
    res.json(await user.show(req))
  } catch (error) {
    res.sendStatus(500);
  }
});

/* POST users store */
router.post('/', async (req, res, next) => {
  const saltRounds = 10;
  const { identifier, password, name, email, is_active, app_id } = req.body;
  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) return res.sendStatus(500);
    const payload = {
      identifier,
      name,
      email,
      password: hash,
      is_active: is_active || 1,
      app_id,
    };
    try {
      const queryResults = await user.store(payload);
      if (!queryResults) return res.sendStatus(500);
      res.sendStatus(200);
    } catch (error) {
      return res.sendStatus(500);
    }
  });
});

/* PUT users update */
router.put('/:id', async (req, res, next) => {
  if (!(await user.show(req))) {return res.sendStatus(403)}
  const saltRounds = 10;
  const { identifier, password, name, email, is_active } = req.body;
  bcrypt.hash(password, saltRounds, async (err, hash) => {
    if (err) return res.sendStatus(500);
    const payload = {
      params: {id: req.params.id},
      body: {
        identifier,
        name,
        email,
        password: hash,
        is_active: is_active,
      }
    };
    try {
      const queryResults = await user.update(payload);      
      if (queryResults.affectedRows) {
        res.sendStatus(200);
      } else {
        res.sendStatus(500);
      }
    } catch (error) {
      return res.sendStatus(500);
    }
  });
});

/* DELETE users destroy */
router.delete('/:id', async (req, res, next) => {
  if (!(await user.show(req))) {return res.sendStatus(403)}
  await user.destroy(req)
  res.sendStatus(200);
});

module.exports = router;
