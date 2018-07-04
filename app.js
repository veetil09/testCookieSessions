/**
 * Created by veetil on 2018-05-09.
 */

const app = require('express')();
const fs = require('fs');
const expressSessions = require('express-session');

const readStream = fs.createReadStream('./sample.txt', 'utf-8');

const FileStore = require('session-file-store')(expressSessions);

const asyncMiddleware = (asyncFunction) =>
   (req,res,next) => asyncFunction(req, res, next)
      .catch(asyncErrors => next());

app.use(require('morgan')('dev'));

app.use(expressSessions({
    name: 'server-session-cookie-id',
    secret: 'express-session-secret',
    saveUninitialized: true,
    resave: true,
    store: new FileStore()
}));

function readFileAsynchOperation() {
    
    return new Promise((resolve, reject) => {
        /*setTimeout(() => {
          return reject(true);
        }, 3000);*/
        let data = '';

        readStream.on('data', (chunk) => {
                console.log('chunk: ', chunk);
                data = `${data} ${chunk}`;
            })
            .on('end', () => {
                console.log('Complete data: ', data);
                return resolve(data);
            })
            .on('error', (err) => {
                console.log('Error: ', err);
                return reject(err);
            });
    });
}

app.get('/', asyncMiddleware(async (req, res, next) => {
    
    if(typeof req.session.views === 'undefined') {
        req.session.views = 1;
    } else {
        req.session.views++;
    }
    
    console.log('Req.session injected by express-session: ', req.session);
    
    const amIDone = await readFileAsynchOperation();
    
    res.send(`File contents: ${amIDone}\n`);
}));

const server = app.listen(3111, () => {
   console.log(`${server.address().address} listening on ${server.address().port}`);
});
