var request = require('sync-request');
var mongoose = require('mongoose');
mongoose.connect("mongodb://spider:spider@ds049161.mlab.com:49161/search-engine");
var Schema = mongoose.Schema;
var async = require('async');

var queue = ['https://www.google.ca/#q=cars'];

var urlCache = [];

var DataSchema = new Schema({
  title: {
    type: String,
    index: true
  },
  url: {
    type: String,
    index: true
  },
  popularity: Number
});

var Data = mongoose.model('data', DataSchema);

function main() {

  console.log(queue);

  while (queue.length > 0) {

    var res = request("GET", queue[0]);

    var page = "<title>Unknown</title>"

    if (res.statusCode < 300) {
      page = res.getBody().toString();
    }

    var title = "Unknown";
    var url = queue[0];

    var startTitleIndex = page.indexOf("<title>");
    var endTitleIndex = page.indexOf("</title>", startTitleIndex + 7);

    title = page.substring(startTitleIndex + 7, endTitleIndex);

    var index = page.indexOf("<a href=");
    var urlList = [];

    while (index != -1) {

      var endIndex = page.indexOf('"', index + 9);
      url = page.substring(index + 9, endIndex);

      if (url.startsWith("http")) {
        urlList.push(url);
      }

      index = page.indexOf("<a href=", endIndex + 3);

    }

    queue.splice(0, 1);

    var newPage = new Data({
      title: title,
      url: url,
      popularity: 1
    });

    console.log("Saving data: " + url);
    newPage.save(function(err) {

      console.log("Data Saved");

      // Adding new queue list

      for (var i = 0; i < urlList.length; i++) {
        if (!contains(queue, urlList[i])) {
          queue.push(urlList[i]);
        }
      }

      console.log("Calling next site");

      // callling main again
      main();

    });
  }
}

if (queue.length > 0) {
  main();
}

function contains(arr, a) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i] == a)
      return true;
  }
  return false;
}

































//
