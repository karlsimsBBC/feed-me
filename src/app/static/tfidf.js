/*
tfidf.js provides a class which provides methods and data structures for the
creating a tf-idf vector representation of a collection of documents.

It also provides added methods for comparing documents through cosine
similarity.

NOTE: Maybe this should go in the backend?

'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
## Tf-Idf

Term frequency-inverse document frequency (tfIdf) is a measure for finding how
important a term is to a document within a collection of documents. It is a
popular weighting technique in information retreival systems. The basic
assumption behind it is that if a term has a high frequency within a
particualar document but is less common throughout the wider collection
of documents then this is indicative of the term being important to that
document. In the same way tfIdf is also useful for finding corpus specific stop
words (low information words) as words that appear commonly throught the corpus
are have lower tfIdf scores. The method for calculating tfIdf is given as:

  tfIdf = tf * idf

where `tf` is the number of times a term appears in the given document, and
the inverse document frequency is given here as:

  idf = log(N / nt)

where `N` is the total number documents and `nt` is the number of documents the
given term appears in. There are other smoothing and weighting methods for idf
and adjustments are made to achieve desired results.


''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
## Implementation process.

This section describes the process taken to create the tf-idf vector
representation of a collection of documents performed in the `fitTransform`
function.

1. We Start with a array of documents like so.

  [ "the cat in the hat is black!",
    "donnald duck was a friend of the cat.",
    "the matt said 'that was that', and that was that for matt." ]

First we find the unique terms in the document removing any given stopwords and
give each a term a unique id/index. From the above example we get as follows:

  {cat: 0, hat: 1, black: 2, donnald: 3, duck: 4, friend: 5, matt: 6, said: 7}

The index will correspond to the words position in our vector representation.
At the same time as doing this we create an array of documents with the words
transformed into their corresponding ids. Like so:

  [ [ 0, 1, 2 ], [ 3, 4, 5, 0 ], [ 6, 7, 6 ] ]

count the number of times our terms appear in each document this gives us the
term frequencies:

  tf = [[ 1, 1, 1, 0, 0, 0, 0, 0 ],
        [ 1, 0, 0, 1, 1, 1, 0, 0 ],
        [ 0, 0, 0, 0, 0, 0, 2, 1 ]]

At the same time count how many documents each term appears in to get the
document frequency:

  df = [ 2, 1, 1, 1, 1, 1, 1, 1 ]

Apply our idf function `log10(N / nt)` to each df to get the inverse document
frequency:

  idf = [ 0.17, 0.47, 0.47, 0.47, 0.47, 0.47, 0.47, 0.47 ]

Finally perform tf * idf as element-wise multiplication.

  tfIdf = [ [ 0.17, 0.47, 0.47, 0.00, 0.00, 0.00, 0.00, 0.00 ],
            [ 0.17, 0.00, 0.00, 0.47, 0.47, 0.47, 0.00, 0.00 ],
            [ 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.95, 0.47 ] ]


'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

Finding similar documents.

With our tdIdf values we can use cosine similarity as a measure of similarity
in terms of vector space. This is defined as:

  sim = (d1 * d2) / (||d1|| * ||d2||)

In this formula the numerator is a dot product of the 2 document vectors.
and the the denominator is the eucledian norm which is equivilent to.

  sqrt(p0^2 + p1^2 + p2^2 ... pn^2)

Where p0...pn is individual tfidf scores in the document.

With the previously used example generating a comparison matrix with the
function `similarityMatrix` gives us the following:

  sim = [ [ 1.00, 0.05, 0.00 ],
          [ 0.05, 1.00, 0.00 ],
          [ 0.00, 0.00, 1.00 ] ]
*/
class Tfidf {

  constructor(stopwords, tokPattern) {
    this.vocab = {};            // vocabulary to Vect indexs
    this.vect = [];             // stores the tfidf matrix
    this.size = {n: 0, m: 0};   // n documents * vocable size

    // a regex to extract words.
    this.tokPattern = tokPattern || /[A-Za-z]+/ig;

    if (!(stopwords instanceof Set)) {
      stopwords = new Set(stopwords || []);
    }
    this.stopwords = stopwords // given stopwords
  }

  // build the tfidf representation of a collection of documents.
  // a collection is a array of strings.
  fitTransform(collection) {
    // build the vocab and return array of indexes.
    let collectionTokens = this.buildVocab(collection);

    this.size.n = collection.length;

    let df = Array.from(Array(this.size.m), () => 0);

    for (let i = 0; i < this.size.n; i++) {
      this.vect[i] = Array.from(Array(this.size.m), () => 0);
      for (let termIdx of collectionTokens[i]) {
        // increment the document freqency if this is the first time we have
        // seen the termIdx
        if (this.vect[i][termIdx] === 0) {
          df[termIdx]++;
        }
        // increment the term frequency for the document.
        this.vect[i][termIdx]++;
      }
    }
    // map df to idf.
    let idf = df.map(nt => Math.log10(this.size.n / nt));
    // calculate tf-idf scores.
    this.vect = this.vect.map(function(doc) {
      return doc.map((x, i) => x * idf[i]);
    });
    return this.vect;
  }

  // shape returns a object for
  shape() {
    return this.size;
  }

  getVocab() {
    return this.vocab;
  }

  // TODO: separate similarity methods into their own class.

  // compute cosine similarity
  //  sim = (d1 * d2) / (||d1|| * ||d2||)
  // In this formula the numerator is a dot product of the 2 document vectors.
  // and the the denominator is the eucledian norm which is equivilent to
  //    sqrt(p0^2 + p1^2 + p2^2 ... pi^2)
  similarity(doc1, doc2) {
    let dot = 0;
    let eucD1 = 0;
    let eucD2 = 0;
    for (let i = 0; i < this.size.m; i++) {
      dot += doc1[i] * doc2[i];
      eucD1 += Math.pow(doc1[i], 2)
      eucD2 += Math.pow(doc2[i], 2)
    }
    return dot / (Math.sqrt(eucD1) * Math.sqrt(eucD2));
  }

  similarityMatrix() {
    let table = [];
    for (let i = 0; i < this.size.n; i++) {
      let row = [];
      for (let j = 0; j < this.size.n; j++) {
        if (i === j) {
          row.push(-1); // sentinal / non cmp val.
        }
        row.push(this.similarity(this.vect[i], this.vect[j]));
      }
      table.push(row);
    }
    return table;
  }

  // update the vocab dictionary and return collection converted
  // into documents of vocab indexes.
  buildVocab(collection) {
    let collectionTokens = [],
        docTokens;
    for (let doc of collection) {
      docTokens = [];
      // for (let tok of doc.match(/\w+/ig)) {
      for (let tok of doc.match(this.tokPattern)) {
        if (this.stopwords.has(tok)) {
          continue;
        }
        if (!(tok in this.vocab)) {
          this.vocab[tok] = this.size.m;
          this.size.m++;
        }
        docTokens.push(this.vocab[tok]);
      }
      collectionTokens.push(docTokens);
    }
    return collectionTokens;
  }
}

