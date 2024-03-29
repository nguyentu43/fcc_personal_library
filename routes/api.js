/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
const MONGODB_CONNECTION_STRING = process.env.DB;
const mongoose = require('mongoose');
mongoose.connect(MONGODB_CONNECTION_STRING);

const schemaBook = mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  comments: [String]
}, {versionKey: false});

schemaBook.methods.hideComments = function(){
  const obj = this.toObject();
  obj.commentcount = obj.comments.length;
  delete obj.comments;
  return obj;
};

const Book = mongoose.model('Book', schemaBook); 

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      Book.find({}, function(err, books){
        if(err) return res.send('mongodb error');
        res.json(books.map(book => book.hideComments()));
      });
    })
    
    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      const book = new Book({
        title
      });
    
      book.save(function(err, book){
        if(err) return res.send("can't create book");
        res.json(book);
      });
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      Book.remove({}, function(err){
        if(err) return res.send("mongodb error");
        res.send('complete delete successful');
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      Book.findById(bookid, function(err, book){
        if(err) return res.send('mongodb error');
        if(book) res.json(book);
        else res.send('no book exists');
      });
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get
      Book.findById(bookid, function(err, book){
        if(err) return res.send('mongodb error');
        if(!book) res.send('no book exists');
        else {
          book.comments.push(comment);
          book.save(function(err, book){
            if(err) return res.send('mongodb error');
            res.json(book);
          });
        }
      })
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
      //if successful response will be 'delete successful'
      Book.findOneAndDelete({_id: bookid}, function(err, book){
        if(err) return res.send('mongodb error');
        res.send('delete successful');
      });
    });
  
};
