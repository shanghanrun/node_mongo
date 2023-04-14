var router = require('express').Router()

router.get('/shirts',(요청,응답)=>{
  응답.send('셔츠파는 페이지')
})
router.get('/pants',(요청,응답)=>{
  응답.send('바지 파는 페이지')
})

module.exports = router;   // 이 파일에서 router를 배출