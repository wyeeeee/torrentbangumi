import axios from "axios";
import * as cheerio from 'cheerio';
import fs from "fs";
import SocksProxyAgent from 'socks-proxy-agent'
export default class Crawler {
    constructor(proxy,url) {
        this.url=url
            if(proxy){
                var httpsAgent = new SocksProxyAgent.SocksProxyAgent('socks5://'+proxy);
            }else{
                var httpsAgent = null;
            }
            this.config={
                headers: {
                    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Encoding':'gzip, deflate, sdch, br',
                    'Accept-Language':'zh-CN,zh;q=0.8,zh-TW;q=0.6',
                    'Cache-Control':'max-age=0',
                    'Upgrade-insecure-requests':'1',
                    'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.59 Safari/537.36',
                    'X-Chrome-Uma-Enabled':'1',
                    'X-Client-Data':'CJa2yQEIorbJAQjBtskBCKmdygE=',
                    'Connection': 'keep-alive'
                    
                     },
                     httpsAgent
            }
            this.downloadConfig={
                responseType:'stream',
                headers: {
                    'Accept':'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Encoding':'gzip, deflate, sdch, br',
                    'Accept-Language':'zh-CN,zh;q=0.8,zh-TW;q=0.6',
                    'Cache-Control':'max-age=0',
                    'Upgrade-insecure-requests':'1',
                    'User-Agent':'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.59 Safari/537.36',
                    'X-Chrome-Uma-Enabled':'1',
                    'X-Client-Data':'CJa2yQEIorbJAQjBtskBCKmdygE=',
                    'Connection': 'keep-alive'
                    
                     },httpsAgent
            }
    }

    async getIndexHtml(){
        try{
            const response= await axios.get(this.url,this.config);
            const $= cheerio.load(response.data);
            let dayofweekdata={};
            for(let i=0;i<9;i++){
                let daydata=[]
                let $selected=$('[data-dayofweek="'+i+'"] li')
                for(let j=0;j< $selected.length;j++){
                    daydata.push({
                        title:$selected.eq(j).find(".an-text").text(),
                        date:$selected.eq(j).find(".date-text").text() ,
                        href:$selected.eq(j).find(".an-text").attr("href"),
                        pic:$selected.eq(j).find("span").attr("data-src") ,
                    })
                }
                
               dayofweekdata[i]=daydata;
               
            }
            fs.writeFileSync("./src/data.json",JSON.stringify(dayofweekdata,"","\t"), 'utf8');
            this.getPicture(dayofweekdata)
            return dayofweekdata
        }catch(e){
            console.log(e)
        }

    }

    async getDetailSubGroup(detailUrl){
        try{
            let subgroup=[]
            const response= await axios.get(this.url+'/Home/Bangumi/'+detailUrl,this.config);
            const $= cheerio.load(response.data);
            let $selected=$('div.leftbar-nav ul li')
            for(let i=0;i<$selected.length;i++){
                subgroup.push([$selected.find('a').eq(i).attr("data-anchor").split("#")[1] , $selected.find('a').eq(i).text()])
            }
            return subgroup
        }catch(e){
            console.log(e)
        }

    }
    
    async getSubGroupMagnet(subgroupid,detailUrl,take){
        try{
            let magnet=[]
            let magnetUrl=this.url+'/Home/ExpandEpisodeTable?bangumiId='+subgroupid+'&subtitleGroupId='+detailUrl+'&take='+take
            const response= await axios.get(magnetUrl,this.config);
            const $= cheerio.load(response.data);
            let $selected=$('td')
            for(let i=0;i<($selected.length/4);i++){
                magnet.push({'title':$selected.find('.magnet-link-wrap').eq(i).text(),'href':$selected.find('.js-magnet.magnet-link').eq(i).attr("data-clipboard-text"),'size':$selected.eq(i*4+1).text(),'deta':$selected.eq(i*4+2).text()})
            }
            return magnet
        }catch(e){
            console.log(e)
        }

    }

    async getPicture(dayofweekdata){
        try{        
            let picurl=[]
            for(let i=0;i<9;i++){
                for(let j=0;j<dayofweekdata[i].length;j++){
                    picurl.push(dayofweekdata[i][j].pic)
                }
            }
    
            for(let i=0;i<picurl.length;i++){
                fs.stat('./src/pic/'+picurl[i].split("/")[4], (err, stats) => {
                    if (err) {
                        axios.get(this.url+picurl[i],this.downloadConfig).then((res)=>{
                            let z=fs.createWriteStream('./src/pic/'+picurl[i].split("/")[4])
                            res.data.pipe(z)
                        })
                    } 
                  });
        }
    }catch(e){
        console.log(e)
    }
    }
}
//let z=new Crawler("127.0.0.1:7890","https://mikanani.me")
//z.getSubGroupMagnet('2793',53,65)
//z.getDetailSubGroup('https://mikanani.me/Home/Bangumi/227')