var mongoClient = require('mongodb').MongoClient
var assert = require('assert')
var Hashids = require('hashids')
var hashids = new Hashids()

var insertDocument = function(urlLong,seq,db,callback) {//insert document into collection. return urlshort via callback
    var tmp = parseInt(seq)+1
    var urlshort = hashids.encode(tmp)
    var collection = db.collection('documents')
    collection.insertOne({'url_long':urlLong,'url_short':urlshort},function(err,result){
        assert.equal(err,null)
        console.log("Inserted documents into the document collection")
        callback(result,urlshort)
    })
}

var returnSequence = function(db,callback){//return document sequence from 'counter' collection
    var sequence = 0
    var counter = db.collection('counter')
    counter.find({id:'url'}).toArray(function(err,docs){//return sequence order
        if(err) console.error(err)
        if(docs.length===0){//initialize database
            counter.insertOne({id:'url' ,seq: 3000},function(err,result){
                if(err) console.error(err)
                sequence = result.seq
            })
        } else {
            sequence = docs[0].seq
        }
        callback(sequence)
    })
    
}

var updateCounter = function(db,callback){//increment sequence in document in 'counter' collection
    var collection = db.collection('counter')
    collection.updateOne({id:'url'},{$inc:{seq:1}},
    function(err,result){
        if(err) console.error(err)
        console.log("Incrementing the counter")
        callback(result);
    })
}

var deleteDocument = function(db,callback){
    var collection = db.collection('documents')
    collection.deleteMany({},function(err,result){
        assert.equal(err,null)
        console.log("Removed a document")
        callback(result)
    })
}

var findDocument = function(urlShort,db,callback){
    var collection = db.collection('documents')
    collection.find({url_short:urlShort}).toArray(function(err,docs){
        assert.equal(err,null)
        console.log("Found the following records")
        //console.dir(docs)
        if(docs.length===0) console.log("kosong")
        callback(docs)
    })
}

exports.save = function(http,callback) {
    var url = process.env.MONGOLAB_URI
    mongoClient.connect(url,function(err,db){
        assert.equal(null, err)
        console.log("connected correctly to server")
        returnSequence(db,function(seq){
            insertDocument(http,seq,db,function(res,urls){
                updateCounter(db,function(){
                    db.close()
                    callback(res,urls)
                })
            })
        })
    })
}

exports.get = function(shortUrl,callback){
    var url = process.env.MONGOLAB_URI
    mongoClient.connect(url,function(err,db){
        var collection = db.collection('documents')
        collection.find({url_short:shortUrl}).toArray(function(err,docs){
            assert.equal(err,null)
            console.log("Found the following records")
            //console.dir(docs)
            if(docs.length===0) {
                console.log("empty get")
                callback(0)
            } else {
                callback(docs[0].url_long)
            }
        })
    })
}
