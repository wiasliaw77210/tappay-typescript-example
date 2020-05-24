import fs from 'fs';
import path from 'path';
import Koa from 'koa';
import Router from 'koa-router';
import bodyparser from 'koa-bodyparser';
import TapPayService, { PayByPrimeRequest, PayByPrimeResponse } from 'tappay-typescript';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, 'env') })

const app = new Koa();
const router = new Router();
const service = new TapPayService({
  partner_key: process.env.PARTNER_KEY || '',
  env: 'sandbox',
});

router.get('/', (ctx) => {
  const file = fs.readFileSync(path.resolve(__dirname, 'demo.html'));
  ctx.set('Content-Type', 'text/html');
  ctx.body = file;
});

router.post('/pay', async (ctx) => {
  const postData: PayByPrimeRequest = {
    prime: ctx.request.body.prime,
    merchant_id: process.env.MERCHANT_ID || '',
    amount: 1,
    currency: 'TWD',
    details: 'An apple and a pen.',
    cardholder: {
      phone_number: "+886923456789",
      name: "王小明",
      email: "LittleMing@Wang.com",
      zip_code: "100",
      address: "台北市天龍區芝麻街1號1樓",
      national_id: "A123456789"
    },
    remember: true,
  };
  try {
    const response: PayByPrimeResponse = await service.payByPrime(postData);
    ctx.status = 200;
    ctx.body = {
      status: 0,
      rec_trade_id: response.rec_trade_id,
    };
  } catch (err) {
    ctx.status = 400;
    ctx.body = {
      status: -1,
      rec_trade_id: err.message,
    };
  }
});

app.use(bodyparser());
app.use(router.routes());
app.use(router.allowedMethods());
app.listen(process.env.PORT);
