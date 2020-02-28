
(function main() {

  // stopwords must be previously included.
  var tfidf = new Tfidf(stopwords);
  var collection = [];

  for (let item of document.getElementsByClassName("item")) {
    collection.push(item.textContent.replace("\n", "").trim());
  }
  var vect = tfidf.fitTransform(collection);

})();