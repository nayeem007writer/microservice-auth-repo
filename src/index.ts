import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import { any } from 'zod';
import { get } from 'http';

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Hello from inventory service');
});

app.get("/helth",(req,res) => {
    res.json({message:"status: up"})
});

// app.use((req, res, next) => {
//   const allowedOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081'];
//   const origin = req.headers.origin || '';


//   if(allowedOrigins.includes(origin)){
//     res.setHeader('Access-Control-Allow-Origin', origin);
//     next();
//   }
//    else {
//     res.status(403).json({message: 'Forbidden'});
//    }
// });

//Routes



app.use((req, res) => {
        res.status(404).json({meassage: 'not found'});
    });

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => { 
    console.error(err.stack);
    res.status(500).json({message: 'Internal server error!'});
 });    


const PORT = process.env.PORT || 4003;
const serviceName = process.env.SERVICE_NAME || 'auth_service';


app.listen(PORT, () => {
  console.log(`${serviceName} is running on port 🧨🧨🧨🧨🧨🧨🧨🧨🧯🧯🧯🧯🧯===>>>>> ${PORT}`);
});
