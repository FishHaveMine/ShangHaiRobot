import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { RobotKingMuResourceService } from '../../service/resource/robot-kingmu-resource.service';
import { LocalstorageService } from '../../service/LocalstorageService';

@Component({
    selector: 'app-usual-command',
    templateUrl: './usual-command.component.html',
    styleUrls: ['./usual-command.component.scss']
})

export class UsualCommandComponent implements OnInit {

    usualCommands = [];
    @Input() topicId;
    @Output() messagRespone = new EventEmitter();
    userVo: any;
    userId: string;

    constructor(
        private robotKingMuResourceService: RobotKingMuResourceService,
        private local: LocalstorageService) {
    }

    ngOnInit() {
           // 通过登录缓存，获取userID
            this.userVo = this.local.get('userInfo');
            this.userId = this.userVo.userId;    
    }

    public loadcommand(showFlag) {
        if(showFlag) {
            this.usualCommands = [];
            this.robotKingMuResourceService.queryUserRoleByUserId(this.userId).subscribe((actorList) => {
                this.robotKingMuResourceService.getrightcommon().subscribe((commList) => {
                    for (let command of commList) {
                        if (!command.isCheckAuth) {
                            this.usualCommands.push(command.aliasName);
                            continue;
                        }
                        if (command.actorIds && actorList.actorIds) {
                            for (let actorId of command.actorIds) {
                                if (actorList.actorIds.indexOf(actorId) > -1) {
                                    this.usualCommands.push(command.aliasName);
                                    break;
                                }
                            }
                        }
                    }
                });
            });
        } else {
            this.usualCommands = [];
        }
    }

    sendCommand(command) {
        this.robotKingMuResourceService.saveConversation(this.topicId, command).subscribe((dialogueVo) => {
            this.messagRespone.emit(dialogueVo);
        })
    }
}