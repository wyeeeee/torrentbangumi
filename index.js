
import fs from 'fs'
import Koa from 'koa'
import Router from "koa-router"
import serve from "koa-static"
import Crawler from './crawler/crawler.js'
import torrent from './torrent/torrent.js'
import { Readable } from 'stream'
const z=new Crawler("127.0.0.1:7890","https://mikanani.me")
const t=new torrent()
const router = new Router();
const app = new Koa();
var file=null


router.get('/index', async(ctx, res,next) => {
ctx.type = "json";
ctx.body = await z.getIndexHtml();
})


router.get('/', async(ctx, res,next) => {
  const filePath = "./1.html"
  const htmlContent = fs.readFileSync(filePath);
  ctx.type = "html";
  ctx.body = htmlContent;
  })
  

router.get('/addMagnet', async(ctx, res,next) => {

  
  let req_query = ctx.request.query;
  const magnet=req_query.magnet
  file=await t.addMagnet(magnet)
  console.log(file.name)
  ctx.type = "json";
ctx.body = JSON.stringify({"state":'ok'});
})
router.get('/streamVideo', async(ctx, res,next) => {
   let range = ctx.req.headers.range;
  let parts = range.replace(/bytes=/, "").split("-");
  let start = parseInt(parts[0], 10);
  let end = parts[1] ? parseInt(parts[1], 10) : start + 999999;
  let fileSize=file.length
  end = end > fileSize - 1 ? fileSize - 1 : end;
  let chunksize = (end - start) + 1;
  let head = {
    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
   'Accept-Ranges': 'bytes',
    'Content-Length': chunksize,
    'Content-Type': 'video/mp4',
    };
    ctx.res.writeHead(206, head);
    try{
    console.log('11111')
    var s=Readable.from( file.createReadStream({start,end}))
    ctx.body=s
    }catch (e){
    console.log('错误')
      console.log(e)
    }

})

router.get('/detailSubGroup/:detailUrl', async(ctx, res,next) => {
const detailUrl = ctx.params.detailUrl;

ctx.type = "json";
ctx.body = JSON.stringify(await z.getDetailSubGroup(detailUrl));
})

router.get('/detailMagnet/:bangumiId/:subGroupId', async(ctx, res,next) => {
  const bangumiId = ctx.params.bangumiId;
  const subGroupId = ctx.params.subGroupId;
  ctx.type = "json";
  ctx.body = JSON.stringify(await z.getSubGroupMagnet(bangumiId,subGroupId,100));
  })
  


router.get('/setting', (ctx, res,next) => {
  const filePath = "./1.html"
const htmlContent = fs.readFileSync(filePath);
ctx.type = "html";
ctx.body = htmlContent;
})



app.use(serve("./src"))
app.use(router.routes())
app.listen(3001)
