 //jshint esversion:6

 const express = require("express");
 const bodyParser = require("body-parser");

 const mongoose = require("mongoose");
 const app = express();

 const _ = require("lodash");

 mongoose.connect("mongodb+srv://raido-admin:Test123@cluster0.g5eks.mongodb.net/todolistdb", {
   useNewUrlParser: true,
   useUnifiedTopology: true,
   useFindAndModify: false
 });

 const itemSchema = {
   name: {
     type: String,
     required: true
   }
 }

 const ListItem = mongoose.model("listitem", itemSchema);

 const alarm = new ListItem({
   name: "Wake up at 6.30."
 });


 const defaultList = [alarm];

 const listSchema = {
   name: String,
   items: [itemSchema]
 }

 const List = mongoose.model("List", listSchema);

 app.set('view engine', 'ejs');

 app.use(bodyParser.urlencoded({
   extended: true
 }));
 app.use(express.static("public"));




 app.get("/:page", function(req, res) {
   const newPage = _.upperFirst(req.params.page);

   List.findOne({
     name: newPage
   }, function(err, results) {
     if (err) {
       console.log(err);
     } else if (results) {

       //redirect to the existing list
       res.render("list", {
         listTitle: results.name,
         newListItems: results.items
       })

     } else {
       //create a new list
       const newList = new List({
         name: newPage,
         items: defaultList
       })
       newList.save();
       res.redirect("/" + newPage)

     }
   })
 })



 app.get("/", function(req, res) {

   ListItem.find({}, function(err, results) {
     if (results.length === 0) {
       ListItem.insertMany(defaultList, function(err) {
         if (err) {
           console.log(err);
         } else {
           console.log("success");
         }
       });
       res.redirect("/");
     } else {
       res.render("list", {
         listTitle: "Today",
         newListItems: results
       });
     }
   });
 });


 app.post("/", function(req, res) {

   const listButton = req.body.list
   const itemName = req.body.newItem;
   const newItem = new ListItem({
     name: itemName
   })


   if (listButton === "Today") {
     newItem.save();
     res.redirect("/");
   } else {
     List.findOne({
       name: listButton
     }, function(err, results) {
       results.items.push(newItem);
       results.save()
       res.redirect("/" + listButton);
     })
   }

 });

 app.post("/delete", function(req, res) {
   const deleteItem = req.body.deleteButton
   const deleteList = req.body.hiddenInput

   if (deleteList === "Today") {
     ListItem.deleteOne({
         _id: deleteItem
       },
       function(err) {
         if (err) {}
       })
     res.redirect("/");
   } else {
     List.findOneAndUpdate({
       name: deleteList
     }, {
       $pull: {
         items: {
           _id: deleteItem
         }
       }
     }, function(err, results) {
       if (!err) {
         res.redirect("/" + deleteList);
       }
     })
   }
 })



 app.get("/about", function(req, res) {
   res.render("about");
 });

 let port = process.env.PORT;
 if (port == null || port == "") {
   port = 3000;
 }
 app.listen(port, function() {
   console.log("Listening to KUKU raadio 3000");
 });

 // app.listen(3000, function() {
 //   console.log("Server started on port 3000");
 // });