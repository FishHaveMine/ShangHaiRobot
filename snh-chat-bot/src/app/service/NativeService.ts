import { ActivatedRoute, Router } from '@angular/router';
import { HttpService } from '../service/HttpService';
import { Injectable } from '@angular/core';

declare let window;

let win = null;
let nw = window.nw;

if (nw && nw.Window) {
  win = nw.Window.get();
}

@Injectable()
export class NativeService {

  constructor(
    private router: Router,
    private http: HttpService
  ) { }

  public width = win ? win.width : 0;
  public height = win ? win.height : 0;

  // 打开新窗口
  public open(url: String, options: Object, callback: Function) {
    if (nw && nw.Window) {
      nw.Window.open(url, options, function (new_win) {
        if (callback) {
          callback(new_win);
        }
      });
    } else if (window && window.open) {
      let win = window.open(url);
      callback(win);
    }
  }

  // 移动窗体
  public moveTo(x: Number, y: Number) {
    if (win) {
      win.moveTo(x, y);
    }
  }

  public moveBy(x: Number, y: Number) {
    if (win) {
      win.moveBy(x, y);
    }
  }

  // 设置窗体大小
  public resizeTo(x: Number, y: Number) {
    if (win) {
      win.resizeTo(x, y);
    }
  }

  // 最小化
  public minimize() {
    if (win) {
      win.minimize();
    }
  }

  // 最大化
  public maximize() {
    if (win) {
      win.maximize();
    }
  }

  public restore() {
    if (win) {
      win.restore();
    }
  }

  // 关闭页面
  public close() {
    if (win) {
      win.close();
    }
  }

  // 显示隐藏
  public show(visable: Boolean) {
    if (win) {
      win.show(visable);
    }
  }

  // 是否展示任务栏图标
  public setShowInTaskbar(show) {
    if (win) {
      win.setShowInTaskbar(show);
    }
  }

  public setTransparent(transparent: Boolean) {
    if (win) {
      win.setTransparent(transparent);
    }
  }

  public showDevTools(iframe?: String, callback?: Function) {
    if (win) {
      win.showDevTools(iframe, callback);
    }
  }

  // nw.Shell.openExternal('https://github.com/nwjs/nw.js');
  public openExternal(url) {
    if (nw) {
      nw.Shell.openExternal(url);
    }
  }

  // 退出App
  public quit() {
    if (nw) {
      nw.App.quit();
    }
  }

  private tray: any = null;

  public removeTray() {
    this.tray.remove();
    this.tray = null;
  }

  public createTray() {
    if (this.tray === null) {
      this.tray = new nw.Tray({ title: '共享机器人', tooltip: '共享机器人', icon: 'image/ico/main.png' });
      this.tray.on('click', () => {
        win.show(true);
      });
      // Give it a menu
      var menu = new nw.Menu();
      menu.append(new nw.MenuItem({
        type: 'normal', label: '关于', click: () => {
          this.open(window.location.origin + window.location.pathname + '/index.html#/aboutus', {
            width: 450,
            height: 356,
            "min_width": 450, // 700
            "min_height": 356, // 500
            focus: true,
            frame: false
          }, () => {})
        }
      }));
      menu.append(new nw.MenuItem({
        type: 'normal', label: '注销', click: () => {
          this.removeTray();
          this.http.logout().subscribe(() => {
            window.chrome.runtime.reload();
          }, () => {
            window.chrome.runtime.reload();
          })
        }
      }));
      menu.append(new nw.MenuItem({
        type: 'normal', label: '关闭', click: () => {
          nw.App.quit();
        }
      }));
      this.tray.menu = menu;
    }
  }

  public checkUpdate() {
    let pkg;
    let updater = window.require('node-webkit-updater');
    pkg = window.require('../../../package.json');
    // zzm:清除掉node.js的缓存，否则自动更新后还是会弹出更新对话框
    delete window.global.require.cache[window.global.require.resolve('../../../package.json')];
    let upd = new updater(pkg);
    let ncp = window.require('fs-extra').copy;

    upd.checkNewVersion((error, newVersionExists, newPatchExists, manifest) => {
      if (null != error) {
        return;
      }
      if (newVersionExists) {
        nw.Window.open('./source/updater.html', {
          "position": "center",
          "title": "自动更新",
          "frame": true,
          "width": 550,
          "height": 350,
          "resizable": false,
          "always_on_top": true,
          "icon": 'image/ico/main.png',
          "focus": true
        }, (updateWin) => {
          updateWin.on('loaded', () => {
            setTimeout(() => {
              let win = nw.Window.get()
              updateWin.window.setParent(win, manifest, pkg, (callback) => {
                this.removeTray();
                this.http.logout().subscribe(() => {
                  callback();
                }, () => {
                  callback();
                })
              });
            }, 100);
          });
        });
      }
    })
  }

  private clearCookie(params) {
    win.cookies.remove(params);
  }

  // 清除GRC的cookies
  public clearCookies() {
    win.cookies.getAll({
      name: 'ecpDataContext.tokenId'
    }, (data) => {
      if (data && data.length > 0) {
        let domain = data[0].domain;
        // 清除两次，不确定是http还是https
        // ecpDataContext.tokenId
        // sk_id
        let url = 'http://' + domain;
        try {
          this.clearCookie({
            url,
            name: 'ecpDataContext.tokenId'
          })
          this.clearCookie({
            url,
            name: 'sk_id'
          })
        } catch(e) {
          url = 'https://' + domain;
          this.clearCookie({
            url,
            name: 'ecpDataContext.tokenId'
          })
          this.clearCookie({
            url,
            name: 'sk_id'
          })
        }
      }
    })
  }

}