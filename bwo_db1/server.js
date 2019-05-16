var oracledb = require('oracledb');
var dbConfig = require('./config/dbconfig.js');
var express = require('express');
var request = require('request');
var responseTime = require('response-time')
var path = require('path');

var app = express();
var public_dir = './public/';
var basepath = '/v1';
app.use(responseTime());


//added for ACCS
var LISTEN_PORT = process.env.PORT || 48484;
app.listen(LISTEN_PORT, function () {
    console.log('listening on port : ' + LISTEN_PORT);
});

//Retrieve all employees
app.get(basepath + '/emp', function (req, res) {

    // Get a non-pooled connection
    oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }

            connection.execute(
                "set sqlformat jsof",
                function () {
                    connection.execute(
                        // The statement to execute
                        "select * from employees",
                        //"select e.employee_id,e.last_name  from employees e, departments d where e.department_id = d.department_id",
                        //and e.employee_id=100",
                        // The callback function handles the SQL execution results
                        function (err, result) {
                            if (err) {
                                console.error(err.message);
                                doRelease(connection);
                                return;
                            }
                            //console.log(result.metaData); // [ { name: 'DEPARTMENT_ID' }, { name: 'DEPARTMENT_NAME' } ]
                            //console.log(result.rows); // [ [ 180, 'Construction' ] ]

                            res.send(result);
                            console.log('Processing took: ' + res.get('x-response-time'));


                            doRelease(connection);
                        }
                    );
                }
            );
        }


    );

    // Note: connections should always be released when not needed
    function doRelease(connection) {
        connection.close(
            function (err) {
                if (err) {
                    console.error(err.message);
                }
            });
    }
});
//Retrieve one employee
app.get(basepath + '/emp/:empid', function (req, res) {

    // Get a non-pooled connection
    oracledb.getConnection({
            user: dbConfig.user,
            password: dbConfig.password,
            connectString: dbConfig.connectString
        },
        function (err, connection) {
            if (err) {
                console.error(err.message);
                return;
            }

            var empid = req.params.empid;
            connection.execute(
                "set sqlformat jsof",
                function () {
                    if (!!+empid) {
                      var sql = "select * from employees where employee_id= :empid";
                      var binds = [req.params.empid];


                    }else{
                      var sql = "select * from employees";
                      var binds =[];

                    }


                    connection.execute(sql, binds,

                        function (err, result) {
                            if (err) {
                                console.error(err.message);
                                doRelease(connection);
                                return;
                            }

                            res.send(result);
                            console.log('Processing took: '  + res.get('x-response-time'));


                            doRelease(connection);
                        }
                    );
                }
            );
        }


    );

    // Note: connections should always be released when not needed
    function doRelease(connection) {
        connection.close(
            function (err) {
                if (err) {
                    console.error(err.message);
                }
            });
    }
});
