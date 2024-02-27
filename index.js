
const express =require('express');
const app = express();
const port = process.env.PORT || 5500;
const helmet = require('helmet');

//adding helmet middleware
app.use(helmet());

//handlebars
const engineHandleBars  = require ('express-handlebars');

//static folder
app.use(express.static(__dirname + '/securityPuplic'));



//define engine handlebars
app.engine('hbs',engineHandleBars.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout'
}));
app.set('view engine','hbs');



//route
app.get('/createUser',(req,res)=>{
    let models = require('./models');
    models.sequelize.sync().then(()=>{
        res.send('create user!!!')
    })
});


app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/:page',(req,res)=>{
    res.render(req.params.page);
});

app.get('/',(req,res)=>{
    res.send('Hello world');
});

//start web server;
app.listen(port,()=>{
    console.log(`server is listening on port ${port}`);
})

