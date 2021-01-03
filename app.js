const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Set templating engine
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/wikiDB', {useNewUrlParser: true, useUnifiedTopology: true});

const articleSchema = new mongoose.Schema({
  title: String,
  content: String
});

const Article = mongoose.model('Article', articleSchema);

// REST API (Should have these routes: GET, POST, DELETE, PUT, PATCH)

////////////////////// Requests targeting all articles //////////////////////

// Chainable route handlers
app.route('/articles')
  .get(function(req, res) {

    Article.find({}, function(err, foundArticles) {
      if (err) {
        res.send(err);
      } else {
        res.send(foundArticles);
      }
    });

  })
  .post(function(req, res) {

    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
    });

    newArticle.save(function(err) {
      if (err) {
        res.send(err);
      } else {
        res.send('Successfully added a new article.');
      }
    });

  })
  .delete(function(req, res) {

    Article.deleteMany({}, function(err) {
      if (err) {
        res.send(err);
      } else {
        res.send('Successfully deleted all articles.')
      }
    });

  });

////////////////////// Requests targeting a specific article //////////////////////

app.route('/articles/:articleTitle')
  .get(function(req, res) {

    Article.findOne({title: req.params.articleTitle}, function(err, foundArticle) {
      if (foundArticle) {
        res.send(foundArticle);
      } else {
        res.send('Not article matching that title was found.');
      }
    });

  })
  .put(function(req, res) {

    // If a parameter is missing it will be set to null or remove entirely
    // to me it looks like a dynamic 'patch' as see below is a better way to
    // update articles values
    Article.replaceOne(
      {title: req.params.articleTitle},
      {title: req.body.title, content: req.body.content},
      function(err) {
        if (!err) {
          res.send('Successfully updated article.');
        } else {
          res.send(req.params.articleTitle);
        }
      }
    );

  })
  .patch(function(req, res) {

    // req.body is just a JSON, so we can use it to dynamically 'patch' 
    // (maybe both params are changed maybe just one)
    // req.body = {
    //   title: 'test',
    //   content: 'test'
    // }
    // OR
    // req.body = {
    //   title: 'test',
    // }

    Article.updateOne(
      {title: req.params.articleTitle},
      {$set: req.body},
      function(err) {
        if (!err) {
          res.send('Successfully updated/patched articles.')
        } else {
          res.send(err);
        }
      }
    );

  })
  .delete(function(req, res) {

    Article.deleteOne(
      {title: req.params.articleTitle},
      function(err) {
        if (!err) {
          res.send(`Successfully deleted '${req.params.articleTitle}' article`)
        } else {
          res.send(err);
        }
      }
    );

  });








app.listen(3000, function() {
  console.log("Server up and running on port 3000");
});