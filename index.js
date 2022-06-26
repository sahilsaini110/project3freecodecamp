const dotenv = require("dotenv");

dotenv.config();
var express = require("express");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var cors = require("cors");
var dns = require("dns");
const { url } = require('inspector');
const urlparser = require('url');
var app = express();
var router = express.Router;

// Basic Configuration
const port = process.env.PORT || 3000;

mongoose.connect(process.env.DB_URI, { useNewUrlParser: true });
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function() {
  console.log("we're connected!");
});


//Schema n Model
var schema = new mongoose.Schema({
  id: Number,
  url: String
});
var Url = mongoose.model("Url", schema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

app.post("/api/shorturl", async function (req, res) {
  console.log(req.body);
  const bodyurl = req.body.url;

  const something = dns.lookup(urlparser.parse(bodyurl).hostname, (error, address)=>{
    if (!address){
        res.json ({ error: "invalid url"})
    } else{
      const url = new Url({ url: bodyurl })
      url.save((err, data) =>{
        console.log(data);
        res.json({
          original_url: data.url,
          short_url: data.__v
        })
      })
    }
    console.log("dns" , error);
    console.log("address", address);
  })
  console.log("something", something);
  
});

app.get("/api/shorturl/:id", (req, res) =>{
  const id = req.params.id;
  Url.findById(id, (err, data) =>{
    if(!data){
      res.json({ error:"invalid url"})
    } else {
      res.redirect(data.url)
    }
  })
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});


