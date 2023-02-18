const http = require('http')
const url = require('url')
const fs = require('fs')
const Query = require('querystring')
const path = require('path')
const port = 3000

const Accounts = [{ email: "admin@gmail.com", password: "123" }, {
    email: "duytrinh@gmail.com", password: "123"
}
]

Product = function (id, name, price, image) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.image = image;
}


const Products = [
    new Product(1, "Iphone XS", 1199, 'iamges/iphone-xs.jpg'),
    new Product(2, "Iphone 12 Pro", 1399, 'images/iphone-12-pro.jpg'),
    new Product(3, "Iphone 13 Pro Max", 1699, 'images/iphone-13-pro-max.jpg'),
    new Product(4, "Iphone 13 Mini", 1499, 'images/iphone13-mini.jpg'),
]


// app.get('/login', (req, res) => {
//     res.send("html/login.html")
// })
let islogin = false;

// app.listen(port, () => { console.log("Your app running on port " + port); })
let index = fs.readFileSync(path.join(__dirname, 'html/index.html'));
let login = fs.readFileSync(path.join(__dirname, 'html/login.html'));
const server = http.createServer((req, res) => {
    const Url = url.parse(req.url)
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    if(Url.pathname === '/index' || Url.pathname === '/'){
        if (islogin == true) {
            // res.json("Duydeptrai")
            // req.session.flash
            return res.end(index);
        }
        else {
            // alert("Vui lòng đăng nhập trước khi truy cập trang web");
            return res.end(login);
        }
    }


    if (Url.pathname === '/login' || Url.pathname === '/') {
        if (req.method === 'POST') {
            return handleLogin(req, res);
        }
        else if (req.method === 'GET') {
            return res.end("Phương thức GET không được hỗ trợ trong trường hợp này");
        }
        else res.end("Đường dẫn không hợp lệ");
    }

}).listen(port, () => { console.log("Your app running on port " + port); })



function handleLogin(req, res) {
    let body = ''
    req.on('data', d => body += d.toString())
    req.on('end', () => {
        var input = Query.decode(body)
        if (!input.email || !input.password) {
            return res.end("Vui lòng nhập đầy đủ thông tin");
        }
        
        if (checkLogin(input)) {
            return res.end(index);
        }
        else {
            return res.end("Sai thông tin đăng nhập");
        }
        
    })
}
function checkLogin(input)  {
    if (input == undefined && islogin == true) return true;
    const account = Accounts.find(account => account.email == input.email && account.password == input.password)
    if(islogin == false){
        if (account) {
            islogin = true;
        }
    }
    return islogin;
}