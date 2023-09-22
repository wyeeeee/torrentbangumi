import WebTorrent from "webtorrent"
import { Readable } from 'stream'
export default class torrent{
    constructor() {
        this.client = new WebTorrent()
    }
    async addMagnet(magnet){
        var torrent=this.client.add(magnet, { path: './src/downloads' });
        let refile=null
        torrent.on('metadata', function () {
            const file = torrent.files.find(function (file) {
                return file.name.endsWith('.mp4')
              })
            refile=file
        })
        while(1){
            await this.sleep(5)
                if(refile){
                    return refile
                }
            
        }
}
 sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}