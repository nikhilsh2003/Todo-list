//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://"+secret+"/todolistDB",
  {
    useNewUrlParser: true,
  }
);
  
// Creating item Schema

const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

const date = new Date();

// creating Database

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your Todo List!!",
});

const item2 = new Item({
  name: "Hit the + button to add a new item.",
});

const item3 = new Item({
  name: "<-- Hit this to delete an item.",
});

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  items: [itemsSchema],
});

const List = mongoose.model("List", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length)
      res.render("list", {
        listTitle: "Today",
        newListItems: foundItems,
        presYear: date.getFullYear(),
      });
    else {
      Item.insertMany([item1, item2, item3], function (error) {
        if (error) console.log(error);
        else console.log("Successfully Inserted default items.");
      });
      res.redirect("/");
    }
  });
});

app.post("/", function (req, res) {
  const itemadd = new Item({
    name: req.body.newItem,
  });

  if (req.body.list === "Today") {
    itemadd.save();
    res.redirect("/");
  } else {
    List.findOne({ name: req.body.list }, function (err, foundList) {
      foundList.items.push(itemadd);
      foundList.save();
      res.redirect("/" + req.body.list);
    });
  }
});

app.post("/delete", function (req, res) {
  const list = req.body.list;
  let id = req.body.checkbox;
  if (list === "Today") {
    Item.findByIdAndRemove(id, function (err) {
      if (err) console.log(err);
      else console.log("Deleted successfully");
      res.redirect("/");
    });
  } else {
    List.findOneAndUpdate(
      { name: list },
      { $pull: { items: { _id: id } } },
      function (err) {
        if (err) console.log(err);
      }
    );
    res.redirect("/" + list);
  }
});

app.get("/:page", function (req, res) {
  let page = lodash.capitalize(req.params.page);
  List.findOne({ name: page }, function (err, listFound) {
    if (!listFound) {
      const list = new List({
        name: page,
        items: [item1, item2, item3],
      });
      list.save();
      res.redirect("/" + page);
    } else {
      if (!listFound.items.length) {
        listFound.items.push(item1);
        listFound.items.push(item2);
        listFound.items.push(item3);
        listFound.save();
      }
      res.render("list", {
        listTitle: listFound.name,
        newListItems: listFound.items,
        presYear: date.getFullYear(),
      });
    }
  });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started on port 3000");
});
