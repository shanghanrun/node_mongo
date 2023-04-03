const express = require('express')
const app = express()

app.use(express.urlencoded({extended: true}))
app.use(express.static('src'))  // 폴더
app.listen(8080, function(){
  console.log('listening on  8080')
})

app.get('/beauty', function(req, res){
  console.log('뷰티용품 페이지입니다.')
});



app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});

app.get('/write', function(req, res){
  res.sendFile(__dirname + '/write.html')
})

app.post('/add', function(req, res){
  res.send(req.body.title)
})
