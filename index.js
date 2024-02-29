
const express =require('express');
const app = express();
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
const helmet = require('helmet');

//adding helmet middleware
// app.use(helmet());

//handlebars
const engineHandleBars  = require ('express-handlebars');

//static folder
app.use(express.static(__dirname + '/securityPuplic'));




//define engine handlebars
app.engine('hbs',engineHandleBars.engine({
    layoutsDir: __dirname + '/views/layouts',
    partialsDir: __dirname + '/views/partials',
    extname: 'hbs',
    defaultLayout: 'layout',
    runtimeOptions: {
        allowProtoPropertiesByDefault:true
    },
}));
app.set('view engine','hbs');

//bodyparser
app.use(bodyParser.urlencoded({extended:true}));

//route
app.use('/',require('./routes/indexRouter'));

app.use('/single',require('./routes/commentsRouter'))



//error
app.use((req,res,next)=>{
    res.status(404).send('page not found');
});
app.use((error,req,res,next)=>{
    console.error(error);
    res.status(500).send('internal server');
});

//start web server;
app.listen(port,()=>{
    console.log(`server is listening on port ${port}`);
})

