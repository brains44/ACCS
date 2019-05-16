var oracledb = require('oracledb');

 

var dbConfig = require('./dbconfig.js');

var myDate = new Date(2016, 00, 01, 00, 00, 00, 123);

 

oracledb.getConnection(

  dbConfig,

  function(err, connection) {

    if (err) {throw err;}

 

    connection.execute(

      "alter session set time_zone='America/New_York'",

      function() {

        connection.execute(

          "select to_char(:in_tswltz, 'dd-mon-yyyy hh24:mi:ss.ff tzr') as tswltz, " +

          "  sessiontimezone stz, " +

          "  dump(:in_tswltz) dump " + 

          "from dual",

          {

            in_tswltz: myDate

          },

          {

            outFormat: oracledb.OBJECT

          },

          function(err, result) {

            if (err) {throw err;}

 

            console.log('JavaScript date:      ', myDate);

            console.log('result.rows[0].TSWLTZ:', result.rows[0].TSWLTZ);

            console.log('result.rows[0].STZ:   ', result.rows[0].STZ);

            console.log('result.rows[0].DUMP:   ', result.rows[0].DUMP);

 

            connection.close(function(err) {

              if (err) {throw err;}

            });

          }

        );

      }

    );

  }

);