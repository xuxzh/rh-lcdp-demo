import { Injectable } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { RH_INTERACT_CONFIG, noop } from 'rh-base/core';

@Injectable({
  providedIn: 'root'
})
export class InteractionService {
  constructor(private nzModalSer: NzModalService, private nzMsgSer: NzMessageService) {
    //
  }

  initInteractionConfig() {
    // 信息提示
    RH_INTERACT_CONFIG.logModal = (msg: string) => {
      this.nzModalSer.info({
        nzTitle: '温馨提示:',
        nzContent: msg,
        nzOkText: '确定'
      });
    };

    RH_INTERACT_CONFIG.logMsg = (msg: string) => {
      this.nzMsgSer.info(msg);
    };

    // 警告提示
    RH_INTERACT_CONFIG.warnModal = (msg: string) => {
      this.nzModalSer.warning({
        nzTitle: '警告:',
        nzContent: msg,
        nzOkText: '确定'
      });
    };
    RH_INTERACT_CONFIG.warnMsg = (msg: string) => {
      this.nzMsgSer.warning(msg);
    };

    // 错误提示
    RH_INTERACT_CONFIG.errorModal = (msg: string) => {
      this.nzModalSer.error({
        nzTitle: '错误提示:',
        nzContent: msg,
        nzOkText: '确定'
      });
    };
    RH_INTERACT_CONFIG.errorMsg = (msg: string) => {
      this.nzMsgSer.error(msg);
    };

    // 成功提示
    RH_INTERACT_CONFIG.successModal = (msg: string) => {
      this.nzModalSer.success({
        nzTitle: '错误提示:',
        nzContent: msg,
        nzOkText: '确定'
      });
    };
    RH_INTERACT_CONFIG.successMsg = (msg: string) => {
      this.nzMsgSer.success(msg);
    };

    RH_INTERACT_CONFIG.confirm = (config) => {
      this.nzModalSer.confirm({
        nzTitle: config.title,
        nzContent: config.msg,
        nzOnOk: () => {
          config?.onOk ? config.onOk() : noop();
        },
        nzOnCancel: () => {
          config?.onCancel ? config?.onCancel() : noop();
        },
        nzOkText: config?.okText,
        nzCancelText: config?.cancelText
      });
    };

    RH_INTERACT_CONFIG.loading = (msg: string, duration = 0) => {
      const msgRef = this.nzMsgSer.loading(msg, { nzDuration: duration });
      if (!RH_INTERACT_CONFIG.loadingId) {
        RH_INTERACT_CONFIG.loadingId = msgRef.messageId;
      }
    };

    RH_INTERACT_CONFIG.clearLoading = () => {
      if (RH_INTERACT_CONFIG.loadingId) {
        this.nzMsgSer.remove(RH_INTERACT_CONFIG.loadingId);
        RH_INTERACT_CONFIG.loadingId = null;
      }
    };
  }
}
