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
        message: 'users successfully displayed',
        messageType: 'success',
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'fail to display users',
      messageType: 'error',
    })
  }
})

/* GET users me */
router.get('/me', async (req, res, next) => {
  try {
    const queryResults = await user.me(req);
    res.json({
      ...queryResults,
      message: 'me successfully displayed',
      messageType: 'success',
    })
    
  } catch (error) {
    res.status(500).json({
      message: 'fail to display me',
      messageType: 'error',
    })
  }
});

/**
 * ===========================================================================================
 */

/* GET users index */
router.get('/', async (req, res, next) => {
  try {
    const queryResults = await user.index(req);
    res.json(queryResults);
  } catch (error) {
    res.status(500).json({
      message: 'fail to display users',
      messageType: 'error',
    })
  }
});

/* GET users show */
router.get('/:id', async (req, res, next) => {
  try {
    const queryResults = await user.show(req);
    res.json({
      ...queryResults,
      message: 'user successfully displayed',
      messageType: 'success',
    })
  } catch (error) {
    res.status(500).json({
      message: 'fail to display users',
      messageType: 'error',
    })
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
      if (!queryResults) return res.status(500).json({
        message: 'fail to add user',
        messageType: 'success',
      });
      res.json({        
        message: 'user successfully added',
        messageType: 'success',
      });
    } catch (error) {
      return res.status(500).json({
        message: 'fail to add user',
        messageType: 'error',
      })
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
        res.json({
          message: 'user successfully updated',
          messageType: 'success',
        })
      } else {
        res.status(500).json({
          message: 'fail to update user',
          messageType: 'error',
        })
      }
    } catch (error) {
      return res.status(500).json({
        message: 'fail to update user',
        messageType: 'error',
      })
    }
  });
});

/* DELETE users destroy */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!(await user.show(req))) {
      return res.status(403).json({
        message: 'fail to delete user, you don\'t have right access',
        messageType: 'error',
      })
    }
    await user.destroy(req)
    res.json({
      message: 'user successfully deleted',
      messageType: 'success',
    })
  } catch (error) {
    return res.status(500).json({
      message: 'fail to delete user',
      messageType: 'error',
    })
  }  
});

module.exports = router;
