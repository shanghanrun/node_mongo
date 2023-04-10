const express = require('express')
const app = express()
const MongoClient =require('mongodb').MongoClient
const CONNECT_URL = `mongodb+srv://idim7:iioo[]789456@cluster0.dwajw45.mongodb.net/?retryWrites=true&w=majority`
app.set('view engine', 'ejs')

var db;
MongoClient.connect(CONNECT_URL, {useUnifiedTopology:true},function(에러, client){
  // 연결되면 할 일
  if(에러) return console.log(에러)

  db = client.db('todoapp');
  // db.collection('post').insertOne({이름: 'Choi', 나이: 20, _id:100}, function(에러, 결과){console.log('저장완료') });
  app.listen(8080, function(){
    console.log('listening on  8080')
  })
})

app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))  // 폴더

//app.get('/beauty')   app.post('/add) 는 url(주소창)에 이벤트리스너를 달은 것과 같다.
app.get('/beauty', function(req, res){
  console.log('뷰티용품 페이지입니다.')
});
app.get('/', function(req, res){
  res.render('index.ejs')
});
app.get('/write', function(req, res){
  res.render('write.ejs') 
})

// var db로 선언했기 때문에(전역변수).... 어디에서나 db를 사용할 수 있다.
app.post('/add', function(요청, 응답){
  응답.send('전송완료')
  var 총게시물갯수;
  db.collection('count').findOne({name:'게시물갯수'},function(에러, 결과){ 
    console.log(결과.totalPost)
    총게시물갯수 = parseInt(결과.totalPost)
  
    db.collection('post').insertOne({_id:총게시물갯수+1, 제목: 요청.body.title, 날짜: 요청.body.date}, function(에러, 결과){
    console.log('저장완료')
    db.collection('count').update({name:'게시물갯수'}, {$inc:{totalPost:1}}, function(){})
    })
  })
})  

app.get('/list', function(요청, 응답){
  db.collection('post').find().toArray(function(에러, 결과){
    응답.render('list.ejs', {posts: 결과})
    console.log(결과)
  })    
  // list.ejs는 특별히 지정폴더인 views폴더에 있으므로 응답.sendFile(__dirname+'/list.htm')할 필요가 없다.
  //응답.render()로 화면도 그리지만, 화면을 그릴 때 필요한 데이터도 건낸다.
  //응답은, 서버에서 client(브라우저)로 보내는 것이다.
})

app.delete('/delete', function(요청, 응답){
  console.log(요청.body)   // data: {_id: 4}의 {_id: 4}
  요청.body._id = parseInt(요청.body._id) //HTTP 통신은 숫자를 문자열로 만들어 보내니 {_id:'4'}, 다시 정수로 만들어야 된다.
  const _id_obj = 요청.body   // 변환된 객체를 입력
  db.collection('post').deleteOne(_id_obj, function(){ 
    console.log('삭제완료')
    응답.status(200).send({message:'성공했습니다'}) //{message:'성공'}
  })  
})


app.get('/detail/:id', function(요청,응답){
  db.collection('post').findOne({_id:parseInt(요청.params.id)}, function(에러, 결과){
    if(에러){
      console.log(에러)
      응답.status(404).send('요청한 페이지가 없습니다.')
      return;
    }
    if(결과 === null){ // 결과값이 null일 경우 처리
      응답.status(404).send('요청한 페이지가 없습니다.');
      return;
    }
    console.log(결과)
    응답.render('detail.ejs', {data: 결과})
  })  
})

app.get('/edit/:id', function(요청, 응답){
  db.collection('post').findOne({_id:parseInt(요청.params.id)}, function(에러,결과){
    if(에러){
      응답.send('찾으려는 게시물이 없습니다.'); return
    }
    if(!결과){
      응답.send('찾으려는 게시물이 없습니다.'); return
    }
    응답.render('edit.ejs', {data: 결과})
  })  
})

const methodOverride = require('method-override')
app.use(methodOverride('_method'))

app.put('/edit', function(요청, 응답){
  db.collection('post').updateOne({_id:parseInt(요청.body.id)},{ $set:{제목:요청.body.title, 날짜:요청.body.date}}, function(에러,결과){
    console.log('수정완료')
    응답.redirect('/list')
  })
})


