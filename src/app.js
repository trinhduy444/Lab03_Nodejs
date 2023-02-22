const express = require('express');
const path = require('path');
const morgan = require('morgan')
const port = 3000
const app = express();
const dotenv = require('dotenv');
const multer = require('multer');

dotenv.config();

app.use(morgan('combined'));

const products = [
    { id: 1, name: "Iphone XS", price: 1199, image: '../public/img/iphone-xs.jpg' },
    { id: 2, name: "Iphone 12 Pro", price: 1399, image: '../public/img/iphone12-pro.jpg' },
    { id: 3, name: "Iphone 13 Pro Max", price: 1699, image: '../public/img/iphone-13-pro-max.jpg' },
    { id: 4, name: "Iphone 13 Mini", price: 1499, image: '../public/img/iphone13-mini.jpg' }
]


app.set('views', path.join(__dirname, 'views'));
app.use('/public', express.static(path.join(__dirname, '/public')));
app.set('view engine', 'ejs');

//Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'public/img'));
    },
    filename: function (req, file, cb) {
        const productName = file.originalname.split('.')[0];
        const extension = path.extname(file.originalname);
        const uniqueSuffix = productName + '-' + Date.now();
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    },
});
const upload = multer({ storage });
let islogin = false;
let flashMessage = '';

//CheckLogin
function checkLogin(email, password) {
    const USERNAME_ADMIN = process.env.USERNAME_ADMIN;
    const PASSWORD_ADMIN = process.env.PASSWORD_ADMIN;
    if (email === USERNAME_ADMIN && password === PASSWORD_ADMIN) {
        islogin = true;
        return true;
    }
    return false;
}
//Json
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Login
app.get('/login', (req, res) => {
    res.render('login')
})
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    console.log("Email: " + email + " Password: " + password);
    const isValid = checkLogin(email, password);
    if (!isValid) {
        return res.render('login', {
            error: 'Invalid username or password',
        });
    }
    else {
        islogin = true;
        return res.redirect('/');
    }
})

//index
app.get('/', (req, res) => {
    if (islogin == true) {
        res.render('index', {
            products,
            message: flashMessage,
        });
    }
    else { res.redirect('/login') }
}).listen(port, () => { console.log(`Example app listening at http://localhost:${port}`) })


//add
const checkValidForm = (Product) => {
    const { name, price, image } = Product;
    if (!name || !price || !image) {
        return false;
    }
    if (+price < 0) {
        return false;
    }
    return true;
};

app.get('/add', (req, res) => {
    return res.render('add', {
        error: '',
    });
});


app.post('/add', upload.single('image'), (req, res) => {
    const { name, price } = req.body;
    if (!checkValidForm({ name, price, image: req.file })) {
        return res.render('pages/add', {
            error: 'Please fill all fields',
        });
    }
    products.push({
        id: products.length + 1,
        name,
        price,
        image: '../public/img/' + req.file.filename,
    });
    flashMessage = 'Add product successfully';
    return res.redirect('/');
});
//Detail
app.get('/:id', (req, res) => {
    const { id } = req.params;
    console.log(id);
    const product = products.find((product) => +product.id === +id);
    if (!product) {
        return res.send('Product not found');
    }
    res.render('product', {
        product,
    });
});

app.post('/delete/:id', (req, res) => {
    const { id } = req.params;
    const product = products.find((product) => +product.id === +id);
    if (!product) {
        return res.send('Product not found');
    }
    products.splice(products.indexOf(product), 1);
    flashMessage = 'Delete product successfully';
    return res.redirect('/');
})
app.get('/edit/:id', (req, res) => {
    const { id } = req.params;
    let product = products.find((product) => +product.id === +id);
    let error = '';
    if (!product) {
        error = 'Product not found';
    }
    res.render('edit', {
        product,
        error,
    });

})

app.post('/edit/:id', upload.single('image'), (req, res) => {
	const { id } = req.params;
	const { name, price } = req.body;
	const product = products.find((product) => +product.id === +id);
	if (!product) {
		return res.render('edit', {
			error: 'Product not found',
		});
	}

	product.name = name ? name : product.name;
	product.price = price ? price : product.price;
	product.image = req.file ? '../public/img/' + req.file.filename : product.image;
	flashMessage = 'Update product successfully';
	return res.redirect('/');
});