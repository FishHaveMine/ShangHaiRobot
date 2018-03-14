import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Headers, Http, RequestOptions, URLSearchParams } from '@angular/http';
import CryptoJS from "crypto-js";
import { LocalstorageService } from '../../service/LocalstorageService';
import { NativeService } from '../../service/NativeService';
import { HttpService } from '../../service/HttpService';

declare let window;

if (window.nw && window.require) {
  window.os = window.require('os');
}

function encrypt(content, srcKey) {
  if (!srcKey) {
    return "";
  }
  var keyLen = 8;
  var srcKeyLen = srcKey.length;

  if (srcKeyLen > keyLen) {
    srcKey = srcKey.substr(0, keyLen);

  } else {
    var paddLen = keyLen - srcKeyLen;
    for (var i = 0; i < paddLen; i++) {
      srcKey += "0";
    }
  }
  var key = CryptoJS.enc.Utf8.parse(srcKey);
  var encryptStr = CryptoJS.DES.encrypt(content, key, {
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
  });
  return encodeURIComponent(encryptStr.toString());
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  encapsulation: ViewEncapsulation.Emulated // None | Emulated | Native
})
export class LoginComponent implements OnInit {

  selectedOrg: any;
  orgs = [];
  isAutoLogin: boolean = true;
  isSavePassword: boolean = false;
  token = "";
  errorMessage = '';

  // 如果密码有修改，需要重新加密
  noNeedEncryptPassword = false;

  input = { userName: '', password: '' };

  // 如果自动登录的话，需要调用loginStepFirst获取token，此时不需要调用登陆第二步。
  noNeedloginStepSecond = false;

  // 控制CC登录或者管控
  useCCLogin = false;

  constructor(
    private router: Router,
    private local: LocalstorageService,
    private native: NativeService,
    private http: HttpService,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.native.resizeTo(557, 575);
    let x = Math.round((window.screen.availWidth - 557) / 2);
    let y = Math.round((window.screen.availHeight - 575) / 2);
    this.native.moveTo(x, y);
    this.native.setShowInTaskbar(true);
    this.native.checkUpdate();
    this.native.createTray();

    let isLogout = this.local.get('isLogout');
    this.local.remove('isLogout');

    this.isAutoLogin = this.local.get("auto_login");
    if (this.local.get("save_user")) {
      this.noNeedEncryptPassword = true;
      this.isSavePassword = true;
      this.input = this.local.get("save_user");
      this.selectedOrg = this.local.get('selected_org');
      if (this.selectedOrg) {
        this.orgs.push(this.selectedOrg);
      }
      if (!this.useCCLogin && !this.isAutoLogin) {
        this.loginStepFirst();
      }
    }
    if (this.isAutoLogin && !isLogout) {
      if (this.useCCLogin) {
        this.onClickMe();
      } else {
        // 自动登陆需获取token，然后再调用登录第三步
        this.noNeedloginStepSecond = true;
        this.loginStepFirst();
      }
    }
  }

  queryOrgs(loginForm) {
    if (this.input.userName && this.input.password && 
      (loginForm.form.get('username').dirty || loginForm.form.get('password').dirty)) {
      if (this.useCCLogin) {
        // this.onClickMe();
      } else {
        if (loginForm.form.get('password').dirty) {
          this.noNeedEncryptPassword = false;
        } else {
          this.noNeedEncryptPassword = true;
        }
        this.loginStepFirst();
      }
    }
  }

  savePassword() {
    this.isSavePassword = !this.isSavePassword;
  }

  autoLogin() {
    this.isAutoLogin = !this.isAutoLogin;
  }

  onClickMe() {
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' });
    let options = new RequestOptions({ headers: headers });
    let _urlParams = new URLSearchParams();
    let encryptedPassword = this.input.password;
    if (!this.noNeedEncryptPassword) {
      encryptedPassword = encrypt(this.input.password, this.input.userName);
    }
    _urlParams.append('userName', this.input.userName.trim());
    _urlParams.append('password', encryptedPassword);
    _urlParams.append('loginType', '1');
    _urlParams.append('deviceId', this.getMacAddress());

    this.http.post('login', _urlParams, options).subscribe((res) => {
      if (res && res.status === 200) {
        let userVo = res.json();
        if (userVo.authenticated) {
          this.local.set('userInfo', userVo);
          this.local.set('auto_login', this.isAutoLogin)
          if (this.isSavePassword) {
            let saveUser = {
              userName: this.input.userName,
              password: encryptedPassword
            }
            this.local.set('save_user', saveUser);
          } else {
            this.local.remove('save_user');
          }
          this.router.navigate(['home']);
        } else {
          this.errorMessage = userVo.errorMessage;
        }
      }
    })
  }

  login(loginForm) {
    if (!loginForm.valid) {
      if (loginForm.form.get('username').invalid) {
        this.errorMessage = "用户名为空";
      } else if (loginForm.form.get('password').invalid) {
        this.errorMessage = "密码为空";
      }
    } else {
      if (loginForm.form.get('password').dirty) {
        this.noNeedEncryptPassword = false;
      } else {
        this.noNeedEncryptPassword = true;
      }
      if (this.useCCLogin) {
        this.onClickMe();
      } else {
        this.loginStepThird();
      }
    }
  }

  // 登陆第一步，根据用户名跟密码获取token
  loginStepFirst() {
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' });
    let options = new RequestOptions({ headers: headers });
    let _urlParams = new URLSearchParams();
    let encryptedPassword = this.input.password;
    if (!this.noNeedEncryptPassword) {
      encryptedPassword = encrypt(this.input.password.trim(), this.input.userName.trim());
    }
    _urlParams.append('userName', this.input.userName.trim());
    _urlParams.append('password', encryptedPassword);
    this.http.post("ecpLogin/loginStepFirst", _urlParams, options).subscribe((resp) => {
      if (resp && resp.status === 200) {
        let result = resp.json();
        if (result.RET_STATUS) {
          this.errorMessage = "";
          this.token = result.RET_TOKENID;
          if (!this.noNeedloginStepSecond) {
            this.orgs = [];
            this.loginStepSecond();
          } else {
            this.noNeedloginStepSecond = false;
            this.loginStepThird();
          }
        } else {
          this.orgs = [];
          this.errorMessage = result.RET_DESC;
        }
      }
    }, (error) => {
      this.orgs = [];
      // this.errorMessage = result.RET_DESC;
      console.log(error);
      this.errorMessage = "登录失败";
    })
  }

  // 登陆第二步，根据用户名获取组织
  loginStepSecond() {
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' });
    let options = new RequestOptions({ headers: headers });
    let _urlParams = new URLSearchParams();
    _urlParams.append('userName', this.input.userName.trim());
    this.http.post("ecpLogin/loginStepSecond", _urlParams, options).subscribe(resp => {
      if (resp && resp.status === 200) {
        let result = resp.json();
        this.orgs = result;
        this.selectedOrg = result[0];
      }
    })
  }

  // 登录第三步，登录系统
  loginStepThird() {
    let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' });
    let options = new RequestOptions({ headers: headers });
    let _urlParams = new URLSearchParams();
    let encryptedPassword = this.input.password;
    if (!this.noNeedEncryptPassword) {
      encryptedPassword = encrypt(this.input.password.trim(), this.input.userName.trim());
    }
    _urlParams.append('userName', this.input.userName.trim());
    _urlParams.append('password', encryptedPassword);
    _urlParams.append('loginType', '1');
    _urlParams.append('deviceId', this.getMacAddress());
    _urlParams.append('token', this.token);
    _urlParams.append('orgId', this.selectedOrg.orgId);
    _urlParams.append('orgName', this.selectedOrg.orgName);

    this.http.post('ecpLogin/loginStepThirt', _urlParams, options).subscribe((res) => {
      if (res && res.status === 200) {
        let userVo = res.json();
        if (userVo.authenticated) {
          this.local.set('userInfo', userVo);
          this.local.set('auto_login', this.isAutoLogin)
          if (this.isSavePassword) {
            let saveUser = {
              userName: this.input.userName,
              password: encryptedPassword
            }
            this.local.set('save_user', saveUser);
          } else {
            this.local.remove('save_user');
          }
          this.local.set('selected_org', this.selectedOrg);
          this.router.navigate(['home']);
          this.native.show(false)
        } else {
          let result = JSON.parse(userVo.errorMessage);
          if (result) {
            this.errorMessage = result.RET_DESC;
          }
        }
      }
    }, (error) => {
      this.orgs = [];
      console.log(error);
      this.errorMessage = "登录失败";
    })
  }

  closeWindow() {
    this.native.quit();
  }

  getMacAddress() {
    let address = '00:00:00:00:00:00';
    let found = false;
    if (window.os) {
      let obj = window.os.networkInterfaces();
      let keys = Object.keys(obj);
      for (let i = 0; i < keys.length; i++) {
        let value = obj[keys[i]];
        if (Array.isArray(value)) {
          for (let j = 0; j < value.length; j++) {
            if (value[j].mac !== address) {
              address = value[j].mac;
              found = true;
              break;
            }
          }
        }
        if (found) {
          break;
        }
      }
    }
    return address;
  }
}
