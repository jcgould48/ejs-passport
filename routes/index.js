var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res)=>{
  res.render('login');
});

router.get('/register', (req, res) =>{
  res.render('register')
})



// router.get('/loggedIn', (req, res)=>{
//   if(req.isAuthenticated()){
//       return res.render('loggedIn');  
//   }
//   return res.redirect('/login')
// });
// router.get('/registered', (req, res)=>{
//   if(req.isAuthenticated()){
//       return res.render('registered'); 
//   }
//   return res.redirect('/register')
  
// });


router.post('/register',
[
  check('name', 'Name is required')
  .not()
  .isEmpty(),
  check('email', "Please include a valid email").isEmail(),
  check('password', "Please include valid password").isLength({min:3})
], 
(req, res) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
      console.log(errors);
      return res.render('register',{errors : "All inputs must be filled"})
  }
  
  User.findOne({email: req.body.email})
  .then((user) => {
      if(user){
          return console.log('User Exists')
      } else {
          const user = new User();
          const salt = bcrypt.genSaltSync(10);
          const hash = bcrypt.hashSync(req.body.password, salt);

          user.name = req.body.name
          user.email = req.body.email
          user.password = hash;

          user.save().then(user=>{
              // return res.status(200).json({message: "User Created", user});
              req.login(user, err =>{
                  if(err){
                      return res.status(500).json({message: "Server error"});
                  } else {
                      return res.redirect('/registered')
                      // next();
                  }
              })
          }).catch(err=>console.log(err));
      } 
  });
})

router.post('/login', 
passport.authenticate('local-login', {
  successRedirect : '/loggedIn',
  failureRedirect: '/login',
  failureFlash: true,
}))


router.get('/logout',(req, res)=>{
  if(req.user ===undefined){
  req.flash('successMessage', 'You are now logged out');
  return res.redirect('/');
  }
  req.logout();
  req.flash('successMessage', "No one to log out")
  return res.redirect('/')
})

module.exports = router;
