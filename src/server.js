const express = require('express')
const app = express()
const MongoClient =require('mongodb').MongoClient
const CONNECT_URL = `mongodb+srv://idim7:iioo[]789456@cluster0.dwajw45.mongodb.net/?retryWrites=true&w=majority`

var db;
MongoClient.connect(CONNECT_URL, function(에러, client){
  // 연결되면 할 일
  if(에러) return console.log(에러)

  db = client.db('todoapp');
  // db.collection('post').insertOne({이름: 'Choi', 나이: 20, _id:100}, function(에러, 결과){
  //   console.log('저장완료')
  // });

  app.listen(8080, function(){
    console.log('listening on  8080')
  })

  // 내 todoapp db를 사용하려면, 이 안에서 이것을 행해야 된다.?
  app.post('/add', function(req, res){
    db.collection('post').insertOne({제목: req.body.title, 날짜:req.body.date}, function(err, result){
      console.log('제목: ',req.body.title, ' 날짜: ', req.body.date, ' db에 저장함')
    })
    res.send('디비에 저장되었습니다.');// '/add 페이지에 response로 보내는 메시지
    // console.log(req.body)
  })
  

})


app.use(express.urlencoded({extended: true}))
app.use(express.static('src'))  // 폴더



//app.get('/beauty')   app.post('/add) 는 url(주소창)에 이벤트리스너를 달은 것과 같다.
app.get('/beauty', function(req, res){
  console.log('뷰티용품 페이지입니다.')
});


app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html')
});

app.get('/write', function(req, res){
  res.sendFile(__dirname + '/write.html')
})


