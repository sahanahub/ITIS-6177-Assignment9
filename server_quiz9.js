const express = require('express');
const app = express();
const port = 3003;

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi  = require('swagger-ui-express');
const axios = require('axios'); 

const { body, param, validationResult } = require('express-validator');

/**
 * @swagger
 * components:
 *     schemas:
 *         CompanyPost:
 *             type: object
 *             properties:
 *                  companyId:
 *                       required: true
 *                       type: string
 *                  companyName:
 *                       type: string
 *                  companyCity:
 *                       type: string
 *         CompanyPut:
 *             type: object
 *             properties:
 *                  companyName:
 *                       type: string
 *                  companyCity:
 *                       type: string
 *         CompanyPatch:
 *            type: object
 *            properties:
 *                 companyName:
 *                       type: string
 */
 const options={
    swaggerDefinition:{
        openapi: '3.0.0',
            components: {},
        info: {
            title: 'Quiz 08',
            version: '1.0.0',
            description: 'Using swagger for REST-like API'
        },
        host:'157.230.52.160:3003',
        basePath: '/',
    },
    apis: ['./server_quiz9.js'],

};

const specs = swaggerJsDoc(options);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(express.json());

const bodyParser = require("body-parser");
const cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const mariadb = require('mariadb');
const pool = mariadb.createPool({
        host : 'localhost',
        user : 'root',
        password: 'root',
        database:  'sample',
        port: 3306,
        connectionLimit:5
});


app.get('/', (req, res) => {
res.send('Hello!');
});
/**
 * @swagger
 * /customer:
 *   get:
 *      description: Return all customers
 *      produces:
 *           -application/json
 *      responses:
 *          200:
 *              discription: An object of customer containing array of customer code, name, city, working area, company, grade, opening amt, receiving amt, payment amt,
 *                           outstanding amt, phone number and  agent code.
 */
 app.get('/customer', async (req, res) => {
    try {
        const result = await pool.query("select * from customer");
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(result);
    } catch (err) {
        throw err;
    }
});

/**
 * @swagger
 * /company:
 *   get:
 *      description: Return all companies
 *      produces:
 *           -application/json
 *      responses:
 *          200:
 *              discription: An object of company containing array of company id, name and city.
 */
app.get('/company', async (req, res) => {
    try {
        const result = await pool.query("select * from company");
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(result);
    } catch (err) {
        throw err;
    }
});
/**
 * @swagger
 * /agents:
 *   get:
 *      description: Return all agents
 *      produces:
 *           -application/json
 *      responses:
 *          200:
 *              discription: An object of agents containing array of agent id, name, working area, commission, phone number and country.
 */
 app.get('/agents', async (req, res) => {
    try {
        const result = await pool.query("select * from agents");
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(result);
    } catch (err) {
        throw err;
    }
});


const validateCompany = [body('companyId').exists().withMessage('Company ID is required and cannot be empty').notEmpty().trim().escape(),body('companyName').exists().withMessage('companyName is missing').trim().escape(),body('companyCity').exists().withMessage('companyCity is missing').trim().escape()];

const validateCompanyPatch = [body('companyName').exists().withMessage('companyName is missing').trim().escape()];

const validateCompanyPut = [body('companyName').exists().withMessage('companyName is missing').trim().escape(),body('companyCity').exists().withMessage('companyCity is missing').trim().escape()];

const validateCompanyID = [param('id').exists().withMessage('Company ID is required and cannot be empty').notEmpty().trim().escape()];
/**
 * @swagger
 * /company:
 *    post:
 *       description: insert a record into company table
 *       requestBody:
 *             required: true
 *             content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#components/schemas/CompanyPost'
 *       responses:
 *          200:
 *              description: A company was added
 *          422:
 *              description: validation error!
 *          500:
 *              description: Company could not be inserted
 */
 app.post('/company', validateCompany,async(req,res) => {
    let response = {result : 'failed', message: 'Error inserting company'};
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({ errors: errors.array() });
    }
        try{
             const reqbody = req.body;
             const result = await pool.query(
                "insert into company(COMPANY_ID, COMPANY_NAME, COMPANY_CITY) values ('"+ reqbody.companyID +"', '"+ reqbody.companyName +"','"+ reqbody.companyCity +"')"
                );
            if(result.affectedRows){
                response = {result : 'ok'};
                res.status(200);
            } else {
                res.status(500);
            }
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
    } catch (err) {
        response.message = err.message;
        res.status(500);
        res.json(response);
    }
});
/**
 * @swagger
 * /company/{id}:
 *    put:
 *       description: Api endpoint is used to update data to company table
 *       parameters:
 *          - in: path
 *            name: id
 *            required: true
 *            description: Company ID is required
 *            schema:
 *               type: string
 *       requestBody:
 *             required: true
 *             content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#components/schemas/CompanyPut'
 *       responses:
 *          200:
 *              description: Specified Company Updated
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          items:
 *                              $ref: '#components/schemas/CompanyPost'
 *          404:
 *              description: Company not found in database
 *          500:
 *              description: Error updating the Company
 */

 app.put('/company/:id', validateCompanyID, validateCompanyPut,async (req, res) => {
    let response = {result : 'failed', message: 'Error updating data'};
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.json({ errors: errors.array() });
    }
     try {
         const reqbody = req.body;
         const result = await pool.query("UPDATE company SET COMPANY_NAME = '"+reqbody.companyName+"', COMPANY_CITY = '"+reqbody.companyCity+"' WHERE COMPANY_ID = '"+ req.params.id +"'");

            if (result.affectedRows) {
             response = {result : 'ok'};
             res.status(200);
            }  else {
                res.status(404);
                response.message = "Company not found in the database";
             }
             res.setHeader('Content-Type', 'application/json');
             res.json(response);
         } catch (err) {
             response.message = err.message;
             res.status(500);
             res.json(response);
         }
     });
    
    /**
     * @swagger
     * /company/{id}:
     *    patch:
     *       description: API endpoint is used to update only a specific fields to specified company row
     *       parameters:
     *          - in: path
     *            name: id
     *            required: true
     *            description: Company ID is required
     *            schema:
     *               type: string
     *       requestBody:
     *             required: true
     *             content:
     *                  application/json:
     *                      schema:
     *                          $ref: '#components/schemas/CompanyPatch'
     *       responses:
     *          200:
     *            description: Company updated with specified Name
     *            content:
     *                  application/json:
     *                      schema:
     *                          type: object
     *                          items:
     *                              $ref: '#components/schemas/CompanyPost'
     *          404:
     *              description: Company not found in database
     *          500:
     *              description: error updating the Company data
 */

     app.patch('/company/:id', validateCompanyID, validateCompanyPatch ,async (req, res) => {
        let response = {result : 'failed', message: 'Error updating Company Name'};
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ errors: errors.array() });
        }
         try {
             const reqbody = req.body;
             const result = await pool.query("UPDATE company SET COMPANY_NAME = '"+reqbody.companyName+"' WHERE COMPANY_ID = '"+ req.params.id +"'");
    
    
             if (result.affectedRows) {
                 res.status(200);
                 response = {result : 'ok'};
             } else {
                res.status(404);
                response.message = "Company not found in the database";
             }
             res.setHeader('Content-Type', 'application/json');
             res.json(response);
         } catch (err) {
             response.message = err.message;
             res.status(500);
             res.json(response);
         }
     });
    
    /**
     * @swagger
     * /company/{id}:
     *    delete:
     *       description: API endpoint is used to delete record from company table
     *       parameters:
     *          - in: path
     *            name: id
     *            required: true
     *            description: CompanyID is required
     *            schema:
     *               type: string
     *       responses:
     *          200:
     *              description: Specified Company deleted
     *          401:
 *              description: Specified Company not found in database
 *          500:
 *              description: error deleting the Specified Company
 */
     app.delete('/company/:id', validateCompanyID,async (req, res) => {
        let response = {result : 'failed', message: 'Error deleting Company'};
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.json({ errors: errors.array() });
        }
         try {
             const result = await pool.query("DELETE FROM company WHERE COMPANY_ID = '"+req.params.id+"'");
    
             if (result.affectedRows) {
                 response = {result : 'ok'};
                 res.status(200);
             } else {
                res.status(401);
                response.message = "Specified Company not found in the database";
             }
             res.setHeader('Content-Type', 'application/json');
             res.json(response);
         } catch (err) {
             response.message = err.message;
             res.status(500);
             res.json(response);
         }
     });


     app.get("/say", (req, res) => {
        axios.get(`https://enp74ifigjmehffm7vanppyjny0ljcwb.lambda-url.us-east-1.on.aws/say?keyword=${req.query.keyword}`)
        .then((response) => {
            res.send(response.data);
        })
        .catch(error => {
            res.send(error);
        })
    });     
    
    
    app.listen(port, () => {
        console.log('Server_Quiz8 app listening at http://localhost:${port}',port);
    
    });        