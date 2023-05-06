/*
  todo.js -- Router for the ToDoList
*/
const express = require('express');
const router = express.Router();
const TransactionItem = require('../models/TransactionItem')
const User = require('../models/User')


/*
this is a very simple server which maintains a key/value
store using an object where the keys and values are lists of strings

*/

isLoggedIn = (req,res,next) => {
  if (res.locals.loggedIn) {
    next()
  } else {
    res.redirect('/login')
  }
}

// get the value associated to the key
router.get('/transaction/',
  isLoggedIn,
  async (req, res, next) => {
      let transitems=[]
      if (req.query.sortBy == "category") { 
          transitems = await TransactionItem.find({ userId: req.user._id }).sort({ category: 1 })
      }
      else if (req.query.sortBy == "amount"){  
          transitems = await TransactionItem.find({ userId: req.user._id }).sort({ amount: 1 })
      }
      else if (req.query.sortBy == "description") {
          transitems = await TransactionItem.find({ userId: req.user._id }).sort({ description: 1 })
      }
      else if (req.query.sortBy == "date") {
          transitems = await TransactionItem.find({ userId: req.user._id }).sort({ date: 1 })
      }
      else {
          transitems = await TransactionItem.find({ userId: req.user._id })
      }
      res.render('TransactionList',{ transitems });
});



/* add the value in the body to the list associated to the key */
router.post('/transaction',
  isLoggedIn,
  async (req, res, next) => {
      const transaction = new TransactionItem(
          {   description: req.body.description,
              amount: parseInt(req.body.amount),
              category: req.body.category,
              date: req.body.date,
              userId: req.user._id,
              username: req.user.username
          })
      await transaction.save();
      res.redirect('/transaction')
});

router.get('/transaction/remove/:itemId',
  isLoggedIn,
  async (req, res, next) => {
      await TransactionItem.deleteOne({_id:req.params.itemId});
      res.redirect('/transaction')
});

router.get('/transaction/edit/:itemId',
  isLoggedIn,
  async (req, res, next) => {
    const item = await TransactionItem.findById(req.params.itemId);
    res.locals.item = item
    res.render('edit')
});

router.post('/transaction/updateTransactionItem',
  isLoggedIn,
  async (req, res, next) => {
      const {itemId, description, amount, category} = req.body;
      const date = new Date(JSON.stringify(req.body.date))
      console.log("inside /transaction/:itemId");
      await TransactionItem.findOneAndUpdate(
        {_id:itemId},
        { $set: { description, amount, category, date } });
      res.redirect('/transaction')
});

router.get('/transaction/groupByCategory',
  isLoggedIn,
  async (req, res, next) => {
      let result =
            await TransactionItem.aggregate(
              [
                {
                  $match: { 
                    username: req.user.username, 
                  }
                },
                {
                    $group: {
                        _id: '$category',
                        total: { $sum: '$amount' },
                    }
                },
                {
                    $sort: { 
                      total: -1,
                    }
                }
            ]
        )
      res.render('summarize', { result })
});

module.exports = router;
