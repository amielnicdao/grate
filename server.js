//DEPENDENCIES
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");
var cheerio = require("cheerio");

// MODELS
var db = require("./models");

//PORT
var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// MORGAN TO LOG REQUESTS
app.use(logger("dev"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

// MONGODB CONNECTION
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
	// process.env.MONGODB_URI || "mongodb://heroku_ln5zl5jw:sh0r5nqjurcied2gt28htts6f0@ds037358.mlab.com:37358/heroku_ln5zl5jw";
mongoose.connect(MONGODB_URI);

// ROUTES

// A GET ROUTE FOR SCRAPING TECHCRUNCH
app.get("/scrape", function(req, res) {
  axios.get("http://techcrunch.com/").then(function(response) {
    var $ = cheerio.load(response.data);
    $(".post-block").each(function() {
      var result = {};

      result.headline = $(this)
      .children(".post-block__header")
      .children("h2")
      .children("a")
      .text()
      .replace(/[\n\t\r]/g,"");

      result.summary = $(this)
      .children("div")
      .text()
      .replace(/[\n\t\r]/g,"");

      result.url = $(this)
      .children(".post-block__header")
      .children("h2")
      .children("a")
      .attr("href");

      // CREATE A NEW ARTICLE FROM THE RESULT OBJECT
      db.Article.create(result)
        .then(function() {
        })
        .catch(function() {
        });
    });

    // SEND A MESSAGE TO CLIENT
    res.send("Scrape Complete");
  });
});

// ROUTE TO GET ALL ARTICLES FROM THE DATABASE
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// ROUTE FOR GRABBING A SPECIFIC ARTICLE BY ID AND POPULATE IT WITH THE ASSOCIATED COMMENT(S)
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({ _id: req.params.id })
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// ROUTE FOR SAVING/UPDATING AN ARTICLE'S COMMENTS
app.post("/articles/:id", function(req, res) {
  db.Note.create(req.body)
    .then(function(dbNote) {
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// DELETE ROUTE FOR DELETING COMMENTS IN AN ARTICLE
app.delete("/notes/:id", function (req, res) {
	db.Note.findOneAndRemove({ _id: req.params.id }, function(err) {
		if (err) return handleError(err);
	})
		.then(function(dbNote) {
			return dbArticle.findOneandUpdate({ note: dbNote._id }, { note: dbNote._id }, { new: true });
		})
		.then(function(dbArticle) {
			res.json(dbArticle);
		})
		.catch(function(err) {
			res.json(err);
    });
  });

// START SERVER
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});



