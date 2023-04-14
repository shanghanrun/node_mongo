const express = require('express')
const app = express()
const MongoClient =require('mongodb').MongoClient
require('dotenv').config()
const port = process.env.PORT
const dbURL = process.env.DB_URL
app.set('view engine', 'ejs')

var db;
MongoClient.connect(dbURL, {useUnifiedTopology:true},function(에러, client){
  // 연결되면 할 일
  if(에러) return console.log(에러)

  db = client.db('todoapp');
  // db.collection('post').insertOne({이름: 'Choi', 나이: 20, _id:100}, function(에러, 결과){console.log('저장완료') });
  app.listen(port, function(){
    console.log('listening on  8080')
  })
})

app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))  // 폴더

const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session')
app.use(session({secret: '비밀코드', resave: true, saveUninitialized: false}))
app.use(passport.initialize());
app.use(passport.session())

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'pw',
  session: true,
  passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
  //console.log(입력한아이디, 입력한비번);
  db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
    if (에러) return done(에러)
    if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
    if (입력한비번 == 결과.pw) {
      return done(null, 결과)  // 모든게 다 맞음
    } else {
      return done(null, false, { message: '비번틀렸어요' })
    }
  })
}));

passport.serializeUser(function(user,done){
  done(null, user.id)
})
passport.deserializeUser(function(아이디, done){
  db.collection('login').findOne({id:아이디}, function(에러, 결과){
    done(null, 결과)
  })
})




//app.get('/beauty')   app.post('/add) 는 url(주소창)에 이벤트리스너를 달은 것과 같다.
app.get('/beauty', function(req, res){
  console.log('뷰티용품 페이지입니다.')
});
app.get('/', function(req, res){
  res.render('index.ejs')
});
app.get('/write', function(req, res){
  res.render('write.ejs', { user: 요청.user}) 
})

// var db로 선언했기 때문에(전역변수).... 어디에서나 db를 사용할 수 있다.


app.get('/list', function(요청, 응답){
  db.collection('post').find().toArray(function(에러, 결과){
    응답.render('list.ejs', {posts: 결과, user: 요청.user})
    console.log(결과)
  })    
  // list.ejs는 특별히 지정폴더인 views폴더에 있으므로 응답.sendFile(__dirname+'/list.htm')할 필요가 없다.
  //find() 안에 아무것도 안넣으면 모든 자료요구
})

app.get('/search', (요청,응답)=>{
  console.log(요청.query.value)
  const q = 요청.query.value
  db.collection('post').find({제목: {$regex: q}}).toArray((에러,결과)=>{
    if(에러){
      console.log(에러) 
      응답.status(404).send('찾는 자료가 없습니다.');     
      return;
    }
    if(결과 === []){ // 결과값이 빈 배열
      응답.status(404).send('찾는 자료가 없습니다.');
      return;
    }
    console.log(결과)
    응답.render('search.ejs', {posts: 결과})
  })
})

app.delete('/delete', function(요청, 응답){
  console.log(요청.body)   // data: {_id: 4}의 {_id: 4}
  요청.body._id = parseInt(요청.body._id) //HTTP 통신은 숫자를 문자열로 만들어 보내니 {_id:'4'}, 다시 정수로 만들어야 된다.
  var 삭제할데이터 ={_id:요청.body._id, 작성자: 요청.user.id}
  db.collection('post').deleteOne(삭제할데이터, (에러,결과)=>{
    if(에러){ console.log('삭제할 수 없는 이용자입니다.'); return} 
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




app.get('/login',function(요청,응답){
  응답.render('login.ejs')
})

app.post('/login',passport.authenticate('local',{failureRedirect:'/fail'}), function(요청,응답){
  응답.redirect('/')
})

app.get('/fail', function(요청, 응답){
  응답.render('fail.ejs')
})



app.get('/mypage', 로그인했니, function(요청, 응답){
  응답.render('mypage.ejs', { 사용자: 요청.user})
})


function 로그인했니(요청, 응답, next){
  if(요청.user){
    next()
  } else {
    응답.send('로그인 안하셨어요.')
  }
}

app.get('/logout', function(요청,응답){
  요청.logout(function(err) {
    if (err) {
      console.log(err);
    }
    응답.redirect('/login');
  });
})

app.post('/register', (요청, 응답)=>{
  const id = 요청.body.id
  const pw = 요청.body.pw
  const email = 요청.body.email
  const q = {id: id, pw:pw, email: email}
  db.collection('login').insertOne(q), (에러,결과)=>{
    응답.render('/')
  }
})

app.post('/add', function(요청, 응답){
  var 작성자 = 요청.user.id
  console.log('요청.user는 ', 요청.user)
  응답.send('전송완료')
  var 총게시물갯수;
  db.collection('count').findOne({name:'게시물갯수'},function(에러, 결과){ 
    console.log(결과.totalPost)
    총게시물갯수 = parseInt(결과.totalPost)
    var 저장할거 ={_id: 총게시물갯수 +1, 제목:요청.body.title, 날짜:요청.body.date, 작성자: 작성자}
  
    db.collection('post').insertOne(저장할거, function(에러, 결과){
    console.log('저장완료')
    db.collection('count').update({name:'게시물갯수'}, {$inc:{totalPost:1}}, function(){})
    })
  })
})  