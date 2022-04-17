const express = require('express');
const userRole = require('../../services/app/user-role');
const router = express.Router();


/* Get user-role datatable */
router.get('/datatable/:userId', async (req, res, next) => {
  try {
    const data = await userRole.datatable(req);
    res.json({
      widget_title: 'List Roles',
      widget_data: {
        t_head: {
          id: 'id',
          user_id: 'User Id',
          role_id: 'Role Id',
          role_name: 'Role Name',
          created_at: 'Created At',
          updated_at: 'Updated At',
          app_name: 'App Name',
        },
        t_body: data,
        order_col: ['id', 'user_id', 'role_id', 'role_name', 'created_at', 'updated_at', 'app_name'],
        total_data: (await userRole.totalData(req)).total_data,
        base_endpoint: `${process.env.BASE_URL}/user-role/datatable/${req.params.userId}`,
        message: 'user role successfully displayed',
        messageType: 'success',
      }
    })
  } catch (error) {
    res.status(500).json({
      message: 'fail to display user role',
      messageType: 'error',
    });
  }
})

/**
 * ===========================================================================================
 */

/* GET user-role index */
router.get('/', async (req, res, next) => {
  try {
    const queryResults = await userRole.index(req);
    res.json(queryResults);
  } catch (error) {
    res.status(500).json({
      message: 'fail to display user role',
      messageType: 'error',
    })
  }
});

/* GET user-role show */
router.get('/:id', async (req, res, next) => {
  try {
    const queryResults = await userRole.show(req);
    res.json({
      ...queryResults,
      message: 'user role successfully displayed',
      messageType: 'success',
    })
  } catch (error) {
    res.status(500).json({
      message: 'fail to display user role',
      messageType: 'error',
    })
  }
});

/* POST user-role store */
router.post('/', async (req, res, next) => {
  try {
    const queryResults = await userRole.store(req);
    if (queryResults.affectedRows) {
      res.status(200).json({
        message: 'user role successfully added',
        messageType: 'success',
      });
    } else {
      res.status(500).json({
        message: 'fail to add user role',
        messageType: 'error',
      });
    } 
  } catch (error) {
    res.status(500).json({
      message: 'fail to add user role',
      messageType: 'error',
    });
  }  
});

/* PUT user-role update */
router.put('/:id', async (req, res, next) => {
  try {
    if (!(await userRole.show(req))) {
      return res.status(403).json({
        message: 'fail to add user role, you don\'t have right access',
        messageType: 'error',
      })
    }

    const queryResults = await userRole.update(req);
    if (queryResults.affectedRows) {
      res.json({
        ...queryResults,
        message: 'user role successfully added',
        messageType: 'success',
      });
    } else {      
      res.status(500).json({
        message: 'fail to update user role',
        messageType: 'error',
      });
    } 
  } catch (error) {
    res.status(500).json({
      message: 'fail to update user role',
      messageType: 'error',
    });
  }  
});

/* DELETE user-role destroy */
router.delete('/:id', async (req, res, next) => {
  try {
    if (!(await userRole.show(req))) {
      return res.status(403).json({
        message: 'fail to delete user role, you don\'t have right access',
        messageType: 'error',
      })
    }
    await userRole.destroy(req)
    res.json({
      message: 'user role successfully deleted',
      messageType: 'success',
    }); 
  } catch (error) {
    res.status(500).json({
      message: 'fail to delete user role',
      messageType: 'error',
    });
  }  
});

module.exports = router;
