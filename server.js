var express = require('express')
var app = new express()
var linkRegex = new RegExp("^https?:\/\/w{0,3}\\.?[a-zA-Z0-9-]{3,63}\\.[a-z]{2,4}")
var database = require('./app.js')

app.get('/',function(req,res){
    res.sendfile('index.html')
})

app.get('/:id',function(req,res){//fetch short url, look up in db, then redirect
    //res.send(req.params.id)
    database.get(req.params.id,function(link){
        if(link===0){
            console.log("Link from get return 0")
            res.send("Failed link")
        } else {
            console.log("Redirecting link to "+link)
            res.redirect(link)
        }
    })
})

app.get('/new/:id',function(req,res){
    res.send("Please input a URL with a standard format")
})

app.get('/new/*',function(req,res){
    var link = req.path.split("/new/")[1] //get the link from request
    var json = {original_url: null, short_url: null}
    console.log(req.headers.host)
    if(linkRegex.test(link)){
        console.log(linkRegex.test(link))
        json.original_url = link
        database.save(link,function(result,url_short){//save to database, return short link
            json.short_url = "https://"+req.headers.host+"/"+url_short
            res.send(json)
        })
        
    } else {
        console.log(linkRegex.test(link))
        res.send(json)
    }
    
})

app.listen(process.env.PORT||8080,function(){
    console.log("little-url server is listening on port")
})