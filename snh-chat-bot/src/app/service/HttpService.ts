
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';
import { Injectable } from '@angular/core';
import { LocalstorageService } from './LocalstorageService';


// let host = '://10.131.58.211:28280'      // 上海测试ip
// let host = '://10.131.32.217:28280'      // 生产环境
let host = '://10.51.121.32:28280'    // 测试库ip
// let host = '://10.51.111.101'
let baseUrl = 'http' + host + '/webapp/restful/';

@Injectable() // mark 不加报错
export class HttpService {

  constructor(
    private http: Http,
    private local: LocalstorageService
  ) { }

  public baseUrl = baseUrl;
  public host = host;

  public post(url, _urlParams?, options?) {
    return this.http.post(baseUrl + url, _urlParams, options);
  }

  public get(url, _urlParams?) {
    return this.http.get(baseUrl + url, _urlParams);
  }

  public getAppServeUrl() {
    return this.baseUrl;
  }

  public logout() {
    let userVo = this.local.get('userInfo');
    this.local.set('isLogout', true);
    let userToken = userVo.accessToken;
    let userName = userVo.userName;
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' });
    let options = new RequestOptions({ headers: headers });
    let _urlParams = new URLSearchParams();
    _urlParams.append('token', userToken);
    _urlParams.append('userName', userName);
    return this.post('ecpLogin/loginStepFort', _urlParams, options);
  }

  public checkUser(userId) {
    return this.get('monitor/checkUserId?clientFlag=1&userId=' + userId);
  }

  public setConversationReaded(topicId) {
    this.get('conversation/setConversationReaded?syncMessage=true&topicId=' + topicId).subscribe(result => {
      console.log('readed msg for topicId: ' + topicId);
    })
  }

  public keepHeartbeat(token: string, userName: string) {    
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' });
    let options = new RequestOptions({ headers: headers });
    let _urlParams = new URLSearchParams();
    _urlParams.append('token', token);
    _urlParams.append('userName', userName);
    return this.post("ecpLogin/loginStepFifth", _urlParams, options);
  }

}
