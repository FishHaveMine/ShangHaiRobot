import { Injectable } from '@angular/core';
import { HttpService } from '../HttpService';
import { Headers, Http, RequestOptionsArgs, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map';
import { map } from 'rxjs/operator/map';

@Injectable()
export class RobotKingMuResourceService {

    constructor(
        private httpService: HttpService,
        private http: Http
    ) { }

    private BaseUrl = this.httpService.getAppServeUrl();

    private Url = this.BaseUrl + "conversation";
    private UrlA = this.BaseUrl + "ccalice";
    private UrlB = this.BaseUrl + "userActor";
    private itemSettingUrl = this.BaseUrl + "ItemSetting";

    public userId: string = 'e97be413e6cb495c8e83637eea98d6e8'; // cici
    // public userId: string = 'f60d12df98d34f74838a0cb270777150';

    // 获取topId
    public getTopId(userId, pageSize): Observable<any> {
        const param = "?userId=" + userId + "&pageSize=" + pageSize;
        return this.http.get(this.Url + "/queryPersonConver" + param).map(
            res => res.json()
        );
    }

    // 获取聊天记录
    public getConverList(topicId, pageSize, timeStamp): Observable<any> {
        const param = "?timeStamp=" + timeStamp + "&pageSize=" + pageSize + "&topicId=" + topicId;
        return this.http.get(this.Url + "/queryConversationList" + param).map(
            res => res.json()
        );
    }

    public saveConversation(topicId, dialogueInfo): Observable<any> {
        let headers = new Headers({ 'Content-Type': 'application/json;charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        let urlParams = new URLSearchParams();
        const body = { 'topicId': topicId, 'dialogueInfo': dialogueInfo, 'dialogueType': 0 };
        return this.http.post(this.Url + "/saveConversation", body, options).map(res => res.json());
    }

    updateGrcMessageStatus(itemBillId, businessDate, compId, userId, info, status, topicItemId): Observable<any> {
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' });
        let options = new RequestOptions({ headers: headers });
        let urlParams = new URLSearchParams();
        urlParams.set('itemBillId', itemBillId);
        urlParams.set('businessDate', businessDate);
        urlParams.set('compId', compId);
        urlParams.set('userId', userId);
        urlParams.set('info', info);
        urlParams.set('status', status);
        urlParams.set('topicItemId', topicItemId);
        return this.http.post(this.itemSettingUrl + "/updateGrcMessageStatus", urlParams, options);
    }

    // 获取聊天记录
    public getConverListShow(topicId, pageSize, timeStamp, type): Observable<any> {
        const param = "?timeStamp=" + timeStamp + "&pageSize=" + pageSize + "&topicId=" + topicId + "&type=" + type;
        return this.http.get(this.Url + "/queryConversationList" + param).map(
            res => res.json()
        );
    }

    // 按照输入框和时间查询聊天记录
    public getConverListShowByKeyWord(keyWord, pageSize, timeStamp, topicId): Observable<any> {
        const param = "?keyWord=" + keyWord + "&pageSize=" + pageSize + "&timeStamp=" + timeStamp +  "&topicId=" + topicId;
        return this.http.get(this.Url + "/queryConversationByKeyWord" + param).map(
            res => res.json()
        );
    }

    // 获取个人权限命令
    public getrightcommon(): Observable<any> {
        return this.http.get(this.UrlA + "/queryAiCommands").map(
            res => res.json()
        );
    }

    // 用户匹配权限
    public queryUserRoleByUserId(userId) : Observable<any> {
        const param = "?userId=" + userId;
        return this.http.get(this.UrlB + "/queryUserActorByUserId" + param).map(
            res => res.json()
        );
    }
} 