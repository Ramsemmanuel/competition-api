const mysql = require('mysql');
const express = require('express');
var app = express();
const bodyparser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
var PORT = process.env.PORT || 3000;

app.use(bodyparser.json());
app.use(cookieParser());
app.use(session({ secret: 'competition', resave: false, saveUninitialized: false }));

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

var mysqlConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root', //BHbhvaj3xu0xpPB8
    database: 'competitionDB',
    port: 8889,
    multipleStatements: true
});

const dbSetup = () => {
    let tables = [
        {
            tableName: 'users',
            query: `CREATE TABLE users (
                id VARCHAR(255) NOT NULL,
                bio VARCHAR(255),
                alternateCellNumber VARCHAR(255),
                cellNumber VARCHAR(255),
                dateOfBirth VARCHAR(255),
                email VARCHAR(255) NOT NULL,
                imageUrl VARCHAR(255),
                firstName VARCHAR(255) NOT NULL,
                lastName VARCHAR(255) NOT NULL,
                idDocument VARCHAR(255),
                userType VARCHAR(255),
                nationality VARCHAR(255),
                password VARCHAR(255) NOT NULL
            )`
        },
        {
            tableName: 'competitionEntries',
            query: `CREATE TABLE competitionEntries (
                id VARCHAR(255) NOT NULL,
                imageUrl VARCHAR(255) NOT NULL,
                userId VARCHAR(255) NOT NULL,
                artworkDescription VARCHAR(255),
                competitionId VARCHAR(255) NOT NULL,
                entryDate VARCHAR(255)
            )`
        },
        {
            tableName: 'artworks',
            query: `CREATE TABLE artworks (
                id VARCHAR(255),
                artworkDescription VARCHAR(255),
                dateAdded VARCHAR(255),
                imageUrl VARCHAR(255),
                userId VARCHAR(255)
            )`
        },
        {
            tableName: 'entries',
            query: `CREATE TABLE entries (
                id VARCHAR(255),
                artworkId VARCHAR(255),
                competitionId VARCHAR(255),
                entryDate VARCHAR(255),
                userId VARCHAR(255)
            )`
        },
        {
            tableName: 'votes',
            query: `CREATE TABLE votes (
                id VARCHAR(255),
                artworkId VARCHAR(255),
                competitionId VARCHAR(255),
                dateAdded VARCHAR(255),
                modifiedDate VARCHAR(255),
                voterId VARCHAR(255),
                userId VARCHAR(255),
                vote VARCHAR(255)
            )`
        }
    ];

    tables.forEach(table => {
        createTables(table.tableName, table.query);
    });
}

const createTables = (tableName, query) => {
    mysqlConnection.query(`SHOW TABLES LIKE '${ tableName }'`, (error, results) => {
        if(error) {
            return console.log(error);
        }
        else {
            console.log('res', results);
            if(results.length < 1) {
                mysqlConnection.query(query, (err, result) => {
                    console.log(`table ${ tableName }  created`);
                });
            }
            else {
                console.log(`table ${ tableName } exists`);
            }
        } 
    });
};

mysqlConnection.connect((err) => 
    !err ? dbSetup() : console.log('DB connection failed \n Error : ' + JSON.stringify(err, undefined, 2))
);


app.listen(PORT, () => console.log('Express server is runnig at port no : 3000'));

// Get user
app.post('/get-user', (req, res) => {
    let userId = req.body.id;
    mysqlConnection.query(`SELECT * FROM users WHERE id = '${userId}' `, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }

    })
});

// Get user by email
app.post('/get-user-by-email', (req, res) => {
    let email = req.body.email;
    mysqlConnection.query(`SELECT * FROM users WHERE email = '${email}' `, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }

    })
});

//Insert a users
app.post('/add-artwork', (req, res) => {
    let artworkData = req.body;
    mysqlConnection.query('INSERT INTO artworks SET ?', artworkData, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

//Get all artworks
app.get('/artworks', (req, res) => {
    mysqlConnection.query('SELECT * FROM artworks', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

app.post('/user-artworks', (req, res) => {
    let userId = req.body.id;
    mysqlConnection.query(`SELECT * FROM artworks WHERE userId = '${userId}' ORDER BY dateAdded DESC`, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

app.post('/user-artwork', (req, res) => {
    mysqlConnection.query(`SELECT * FROM artworks WHERE id = '${req.body.id}'`, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});


//Delete artworks
app.post('/delete-artwork', (req, res) => {
    let workId = req.body.id;
    mysqlConnection.query(`DELETE FROM artworks WHERE id = '${workId}'`, (err, rows, fields) => {
        if (!err) {
            res.send({
                "code":200,
                "data": rows[0],
                "message":"Deleted successfully"
            });
        }
        else {
            console.log(err);
        }
    })
});

//Update a users
app.put('/update-artwork', (req, res) => {
    let artWorkData = req.body;
    mysqlConnection.query(`UPDATE artworks SET ? WHERE id = '${artWorkData.id}'`, artWorkData, (err, results, fields) => {
        if (results) {
            res.send({
                "code":200,
                "data": results[0],
                "message":"Updated successfully"
            });
        }
        else {
            console.log(err);
        }
    })
});


//Insert a users
app.post('/create-user', (req, res) => {
    let profileData = req.body;
    mysqlConnection.query('INSERT INTO users SET ?', profileData, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else { console.log(err); }
    })
});


//Update a users
app.put('/update-user', (req, res) => {
    let userData = req.body;
    mysqlConnection.query(`UPDATE users SET ? WHERE id = '${userData.id}'`, userData, (err, results, fields) => {
        if (results) {
            res.send({
                "code":200,
                "data": results[0],
                "message":"Updated successfully"
            });
        }
        else {
            console.log(err);
        }
    })
});

app.post('/login', (req, res) => {
    let userData = req.body;
    mysqlConnection.query('SELECT * FROM users WHERE email = ?', [userData.email], (error, results, fields) => {
        if (error) {
            // console.log("error ocurred",error);
            res.send({
              "code":400,
              "failed":"error ocurred"
            })
          }
          else {
            if(results.length > 0) {
              if(results[0].password == userData.password){
                res.send({
                    "code":200,
                    "data": results[0],
                    "success":"login sucessfull"
                });
              }
              else{
                res.send({
                    "code":204,
                    "success":"Email and password does not match"
                });
              }
            }
            else{
                res.send({
                    "code":204,
                    "success":"User does not exits"
                });
            }
          }
    })
});


//Insert entry
app.post('/competition-entry', (req, res) => {
    let entryData = req.body;
    mysqlConnection.query('INSERT INTO entries SET ?', entryData, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

// Get user arkwork entries
app.post('/user-entries', (req, res) => {
    let userId = req.body.userId;
    mysqlConnection.query(`SELECT * FROM entries WHERE userId = '${userId}'`, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

//Get all artworks
app.get('/entries', (req, res) => {
    mysqlConnection.query('SELECT * FROM entries', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

//Update a users
app.put('/update-entry', (req, res) => {
    let entryData = req.body;
    mysqlConnection.query(`UPDATE entries SET ? WHERE id = '${entryData.id}'`, entryData, (err, results, fields) => {
        if (results) {
            res.send({
                "code":200,
                "data": results[0]
            });
        }
        else {
            console.log(err);
        }
    })
});

// =================================================================================== //

//Get all votes
app.get('/votes', (req, res) => {
    mysqlConnection.query('SELECT * FROM votes', (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

// VOTES
app.post('/add-vote', (req, res) => {
    let entryData = req.body;
    mysqlConnection.query('INSERT INTO votes SET ?', entryData, (err, rows, fields) => {
        if (!err) {
            res.send(rows);
        }
        else {
            console.log(err);
        }
    })
});

//Update a users
app.put('/update-vote', (req, res) => {
    let voteData = req.body;
    mysqlConnection.query(`UPDATE votes SET ? WHERE id = '${voteData.id}'`, voteData, (err, results, fields) => {
        if (results) {
            res.send({
                "code":200,
                "data": results[0]
            });
        }
        else {
            console.log(err);
        }
    })
});

