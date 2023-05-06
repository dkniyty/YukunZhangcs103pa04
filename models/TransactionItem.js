
'use strict';
const mongoose = require( 'mongoose' );
const Schema = mongoose.Schema;
const ObjectId = mongoose.Schema.Types.ObjectId;

var transactionItemSchema = Schema( {
  description: String,
  amount: Number,
  category: String,
  date: Date,
  userId: {type:ObjectId, ref:'user' },
  username: String,
} );

module.exports = mongoose.model( 'transactionItem', transactionItemSchema );
