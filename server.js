var express = require("express");
var app = express();
var path = require("path");
var HTTP_PORT = process.env.PORT || 8080;

const mongoose = require('mongoose');
var Schema = mongoose.Schema;

let dbConnection = mongoose.createConnection(`mongodb+srv://DivyaTanwar:admin12345@studentsinfo.fe3hlhj.mongodb.net/FinalExam`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let orderSchema = undefined;
let listModel = undefined;

dbConnection.on('error', (err) => {
    console.log(`Cannot connect to database ${err}`);
});
dbConnection.on('open', () => {
    console.log("Connected to database");

    orderSchema = new Schema({
        "number": String,
        "semester1": Number,
        "semester2": Number,
        "semester3": Number,
    });

    listModel = dbConnection.model("Students_collections", orderSchema);
});

app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({
    extended: true
}));

const {check,validationResult} = require('express-validator');

const onHTTPStart = () => {
    console.log(`Express HTTP server listening on port ${HTTP_PORT}`);
    console.log(`open http://localhost:${HTTP_PORT} on the browser`);
}

app.get("/", function (request, response) {
    response.render('form');
});

let numberRegex = /^[A-Z][a-z][0-9][0-9][0-9][0-9][0-9][0-9][0-9]$/;
const customNumberValidation = (numberInput) => {
    if (numberRegex.test(numberInput)) {
        return true
    } else {
        throw new Error(`Please enter valid Student Number in 'Dd1234567' format`);
    }
};

const customSemValidator = (gpaInput) => {
    if (gpaInput <= 4 ) {
        return true;
    }
    else {
        throw new Error('The entered GPA must be less than 4')
    }
};

app.post("/",
    [
        check('number', '') .notEmpty() .custom(customNumberValidation),
        check('semester1', '') .custom(customSemValidator),
        check('semester2', '') .custom(customSemValidator),
        check('semester3', '') .custom(customSemValidator)

    ],
    function (request, response) {

        const errors = validationResult(request);
        console.log(errors);

        if (!errors.isEmpty()) {
            console.log("errors found here, in this block");
            return response.render('form', {errors: errors.array() })
        }
        else {       
        console.log(`request.body received : ${request.body}`);
        }

            var number = request.body.number;
            var semester1 = request.body.semester1;
            var semester2 = request.body.semester2;
            var semester3 = request.body.semester3;

            var pageData = {
                number: number,
                semester1: semester1,
                semester2: semester2,
                semester3: semester3,
            };

            console.log(`pageData : ${pageData}`);

            let myOrder = new listModel(pageData);

            myOrder.save((err) => {
                if (err) {
                    console.log(`Cannot insert students Info to the collection: ${err}`);
                } else {
                    console.log(`Students info added to the database`);
                }
            });
            response.render('form', pageData);
        }
    );

app.get("/dataList", function (request, response){

        listModel.find({}).exec(function(error, allmarks){
            if (error !== undefined){
                console.log(`Could not retrieve all the records from database : ${error}`);
            }
            response.render('dataList', {marks: allmarks})
        });
});

app.listen(HTTP_PORT, onHTTPStart);