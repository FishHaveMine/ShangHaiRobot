import { Injectable } from '@angular/core';
import { HttpService } from './HttpService';
import { Headers, Http, RequestOptionsArgs, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/map';

@Injectable() // mark 不加报错
export class BacklogService {

  constructor(
    private httpService: HttpService,
    private http: Http
  ) { }
  private BaseUrl = this.httpService.getAppServeUrl();

  private Url = this.BaseUrl + "ItemSetting";
  private headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' });

  public queryItemProjects(ItemType,status): Observable<any>{
    let options = new RequestOptions({ headers: this.headers });
    let _urlParams = new URLSearchParams();
    _urlParams.append('itemType', ItemType);
    _urlParams.append('status', status);
    return this.http.post(this.Url + "/queryItemProjects", _urlParams, options).map(res => res.json());
  }

  public queryItemProjectsByPromise(ItemType,status,isShowAll): Promise<any> {
    let options = new RequestOptions({ headers: this.headers });
    let _urlParams = new URLSearchParams();
    _urlParams.append('itemType', ItemType);      //月结  年结 年终决算
    _urlParams.append('status', status);    
    _urlParams.append('isShowAll', isShowAll);    // 0.显示全部   1.显示待办
    return this.http
    .post(this.Url + "/queryItemProjects", _urlParams, options)
    .toPromise()
    .then(res => res.json())
    .catch();
  }

  public updateProjectUserStatus(projectId,orgId,status): Observable<any>{
    let options = new RequestOptions({ headers: this.headers });
    let _urlParams = new URLSearchParams();
    _urlParams.append('projectId', projectId);
    _urlParams.append('orgId', orgId);
    _urlParams.append('status', status);
    return this.http.post(this.Url + "/updateProjectUserStatus", _urlParams, options).map(res => res.json());
  }

  public getWorkItemTodoListById(newUserId, newLoginOrgId): Observable<any> {
    const param = "?newUserId=" + newUserId + "&newLoginOrgId=" + newLoginOrgId;
    return this.http.get(this.Url + "/getWorkItemTodoListById" + param).map(
        res => res.json()
    );
  }

  public dotest(): Observable<any>{
    return this.http.get(this.Url+"/queryItems").map(
        res => res.json()
    );
  }
}