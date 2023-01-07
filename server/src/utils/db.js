const { Pool } = require('pg');
let fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_SERVER,
  port: process.env.POSTGRES_PORT,
  database: process.env.POSTGRES_DB,
  password: process.env.POSTGRES_PASSWORD,
  port: 5432,
})

  pool.on('connect', () => {
    console.log('connected to the spotlight db');
  });
  
selectNodes = function() {
    return new Promise(async function(resolve, reject) {
        console.log('inside get all nodes db')
        let rtnArray = [];
        await pool.query('SELECT * FROM public.nodes', async (error, results) => {
                if (error) {
                    await createDDL();
                    return;
                }
                if(results.rows.length <= 0){
                    await this.loadData();
                }
                Object.keys(results.rows).forEach(function(key) {
                let customnode = results.rows[key]['nodebody'];
                customnode['addInfo'] = results.rows[key]['id'];
                rtnArray.push(results.rows[key]['nodebody']);
                })
                // console.log(JSON.stringify(results.rows))
                resolve(JSON.stringify(rtnArray))
        })
    })
}

selectConnectors  = function() {
    return new Promise(async function(resolve, reject) {
    console.log('inside get all connectorss db')
    let rtnArray = [];
        await pool.query('SELECT * FROM public.connectors', async (error, results) => {
            if (error) {
                await this.createDDL();
                return
            } 
            if(results.rows.length <= 0){
                await this.loadData();
            }
            Object.keys(results.rows).forEach(function(key) {
                let customnode = results.rows[key]['connectorbody'];
                customnode['addInfo'] = results.rows[key]['id'];
                rtnArray.push(customnode);
                })
            resolve(JSON.stringify(rtnArray))
        })
  })
}
selectDiagram = function(id) {
    return new Promise(async function(resolve, reject) {
        console.log('inside get single diagram db')
        let rtnArray = [];
        await pool.query('SELECT * FROM public.diagrams WHERE id='+id, async (error, results) => {
                if (error) {
                    console.log("error,id "+id+" not found.....")
                    return;
                }
                if(results.rows.length <= 0){
                    console.log("zero rows, id "+id+" not found.....")
                   return
                }
                Object.keys(results.rows).forEach(function(key) {
                    // returns list of diagrams with name and ID for selection list display
                let diagramlist = results.rows[key]['dbody'];
                rtnArray.push(diagramlist);
            })
                // console.log(JSON.stringify(results.rows))
                resolve(JSON.stringify(rtnArray))
        })
    })
}
selectDiagrams = function() {
    return new Promise(async function(resolve, reject) {
        console.log('inside get all diagrams db')
        let rtnArray = [];
        await pool.query('SELECT * FROM public.diagrams', async (error, results) => {
                if (error) {
                    console.log("error, running create DDl......")
                    await createDDL();
                    return;
                }
                if(results.rows.length <= 0){
                    console.log("zero rows, running load diagram data.....")
                    await this.loadDiagramData();
                }
                Object.keys(results.rows).forEach(function(key) {
                    // returns list of diagrams with name and ID for selection list display
                let diagramlist = [results.rows[key]['dname'], results.rows[key]['id']];
                rtnArray.push(diagramlist);
            })
                // console.log(JSON.stringify(results.rows))
                resolve(JSON.stringify(rtnArray))
        })
    })
}
const updateNode = (id, jsonBody) => {
    console.log('inside updare node db call:',jsonBody)
    const text = 'UPDATE public.nodes SET nodebody=$1   WHERE id=$2'
    const values = [jsonBody,id]
      pool.query(text, values, (error, results) => {
            if (error) {
                throw error
            }
        return JSON.stringify(results.rows)
      })
}
  
const updateConnector = (id, jsonBody) => {
    pool.connect((err, client, release) => {
        if (err) {
            return console.error('Error acquiring client', err.stack)
            }
        pool.query('UPDATE public.connectors SET id=?, connetorbody=?, sourcenode=?, targetnode=? WHERE <condition>;', (error, results) => {
            release()
            if (error) {
                throw error
            }
            return json(results.rows)
        })
  }
    )
}
const updateDiagram = (id, jsonBody) => {
    console.log('inside updare diagram db call:',jsonBody)
    const text = 'UPDATE public.diagrams SET dbody=$1   WHERE id=$2'
    const values = [jsonBody,id]
      pool.query(text, values, (error, results) => {
            if (error) {
                throw error
            }
        return JSON.stringify(results.rows)
      })
}
createDDL = function () {
    console.log("Running createDDL function")
    let sql = fs.readFileSync('data/spotlight.ddl.sql').toString();
    console.log("------------ Loaded DDL file:")

        pool.query(sql, function(err, result){
            if(err){
                console.log('--------- DDL error: ', err);
                // process.exit(1001);
                throw err
            }
        });
}
loadData = function () {
    console.log("Running loadData function")
    let sql = fs.readFileSync('data/spotlight.data.sql').toString();
    console.log("Loaded data file:")

        pool.query(sql, function(err, result){
            if(err){
                console.log('Data load error: ', err);
                // process.exit(1000);
                throw err
            }
        });1
}
loadDiagramData = function () {
    console.log("Running loadDiagramData function")
    let f1 = fs.readFileSync('data/f1.json').toString();
    let f2 = fs.readFileSync('data/f2.json').toString();
    let f3 = fs.readFileSync('data/f3.json').toString();
    let empty = fs.readFileSync('data/empty.json').toString();

    let sqle = 'INSERT INTO diagrams(dname,dbody) VALUES (\'Blank Chart\',\''+empty+'\');';
    let sql1 = 'INSERT INTO diagrams(dname,dbody) VALUES (\'F1 Chart\',\''+f1+'\');';
    let sql2 = 'INSERT INTO diagrams(dname,dbody) VALUES (\'F2 Chart\',\''+f2+'\');';
    let sql3 = 'INSERT INTO diagrams(dname,dbody) VALUES (\'F3 Chart\',\''+f3+'\');';
    console.log("Loaded data file: f1,f2,f3,empty")
    console.log(sql1)
        pool.query(sqle, function(err, result){
            if(err){
                console.log('4 Data load error: ', err);
                // process.exit(1000);
                throw err
            }
        });
        pool.query(sql1, function(err, result){
            if(err){
                console.log('1 Data load error: ', err);
                // process.exit(1000);
                throw err
            }
        });
        pool.query(sql2, function(err, result){
            if(err){
                console.log('2 Data load error: ', err);
                // process.exit(1000);
                throw err
            }
        });        
        pool.query(sql3, function(err, result){
            if(err){
                console.log('3 Data load error: ', err);
                // process.exit(1000);
                throw err
            }
        });        

}

initDB = async function () {
    await createDDL();

    await pool.query('SELECT * FROM public.nodes', async (error, results) => {
            if (error) {
                throw error;
            }
            if(results.rows.length <= 0){
                await loadData();
            }
        });
        await pool.query('SELECT * FROM public.connectors', async (error, results) => {
            if (error) {
                throw error;
            }
            if(results.rows.length <= 0){
                await loadData();
            }
        });
        await pool.query('SELECT * FROM public.diagrams', async (error, results) => {
            if (error) {
                throw error;
            }
            if(results.rows.length <= 0){
                await loadDiagramData();
            }
        });
};

module.exports = {
    selectConnectors,
    selectNodes,
    selectDiagrams,
    selectDiagram,
    updateConnector,
    updateNode,
    updateDiagram,
    initDB
}