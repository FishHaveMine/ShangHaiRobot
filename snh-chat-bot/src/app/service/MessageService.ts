
export class MessageService {

  constructor() { }

  public getMsgObj(msg) {
    let obj: any = {};
    if (msg.indexOf('@&@') > -1) {
      let info = msg.replace(/^.*?@\&@/, '').replace(/@\&@.*?$/, '')
      try {
        obj = JSON.parse(info);
      } catch (e) {
        obj.msg = info.replace(/([a-z]|[A-Z]|\d|"|'|{|}|:|,|\s)/gmi, '')
      }
    }
    return obj;
  }

  public getMsgContent(msg) {
    let reg = /@&@.*?@&@/g;
    if (msg.indexOf('@&@') > -1) {
      let commands = msg.match(reg);
      for (let command of commands) {
        let obj = this.getMsgObj(command);
        let replacedText = obj.msg;
        msg = msg.replace(command, replacedText);
      }
    }
    return msg;
  }
}