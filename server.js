var express = require("express");
var app = express();
var path = require("path");
var HTTP_PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

const {check, validationResult} = require('express-validator');

const onHTTPStart = () => {
    console.log(`Express HTTP server listening on port ${HTTP_PORT}`);
    console.log(`open http://localhost:${HTTP_PORT} on the browser`);
}

app.get("/", function(request,response){
    response.render('form');
});



let numberRegex = /^[A-Z][a-z][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/;
const customNumberValidation = (numberInput) => {
    if(numberRegex.test(numberInput)){
        return true
    } else {
        throw new Error(`Please enter valid Student Number.in 'Dd1234567' format`);
    }
}


    let postalCodeRegex = /^[A-Z][0-9][A-Z][ -][0-9][A-Z][0-9]$/;

const customPostalCodeValidation = (postalCodeInput) => {
    if(postalCodeRegex.test(postalCodeInput)){
        return true
    } else {
        throw new Error(`Please enter valid PostalCode in 'A1A 1A1' format.`);
    }
}

app.post("/", 
[
    check('name', 'Name is required').notEmpty(),
    check('email', 'Please enter email in valid format').isEmail(),
    check('number', '').custom(customNumberValidation),
     check('postalcode', '').custom(customPostalCodeValidation),
],
function(request, response) {

    const errors = validationResult(request);
    console.log(errors);

    if(!errors.isEmpty()) {
        response.render('form', {errors: errors.array()});
    }

    if (request.body === undefined) {
        console.log(`Did not receive request object ${request}`);
        response.render('form', {errorMessage: "No data received"});
    }
    else{

        console.log(`request.body received : ${request.body}`);

    var number= request.body.number;
    var name= request.body.name;
    var email = request.body.email;
    var postalcode = request.body.postalcode;

    var pageData = {
        number: number,
        name: name,
        email: email,
        postalcode: postalcode,
    };

    console.log(`pageData : ${pageData}`);
    response.render('form', pageData);
}});


app.get("/about", function(request,response){
    response.render('about');
});

app.listen(HTTP_PORT, onHTTPStart);
