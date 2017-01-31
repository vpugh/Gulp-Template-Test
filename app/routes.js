var app = express();

nunjucksRender.configure('views', {
	autoescape: true;
	express: app
});

app.get('/', function(reg, res) {
	res.render('index.html');
})