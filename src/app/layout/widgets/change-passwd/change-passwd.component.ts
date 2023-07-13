import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { FormHelper, MsgHelper, RhStorageService } from 'rh-base/core';
import { RhUserAccountInfo, OpMode, RhUpdatePasswordDto } from 'rh-base/model';
import { AppService } from 'src/app/app.service';

import { RhMainService } from '../../../routes/main/main.service';
@Component({
  selector: 'app-change-passwd',
  templateUrl: './change-passwd.component.html',
  styleUrls: ['./change-passwd.component.less']
})
export class ChangePasswdComponent implements OnInit {
  // ***************密码********************
  updatePasswordDto!: RhUpdatePasswordDto;
  updatePasswordForm!: UntypedFormGroup;
  newPwd = null;

  updateLoading = false;
  /** 密码框是否显示明文 */
  oldpasswordVisible = false;
  newpasswordVisible = false;
  newpasswordVisible2 = false;

  userAccountInfo: RhUserAccountInfo | null = null;
  @Output() rhClose = new EventEmitter();

  isCorrectPwd: boolean | null = null;

  constructor(public fb: UntypedFormBuilder, public operator: RhMainService, public appSer: AppService) {}

  ngOnInit() {
    const user = this.appSer.getUserSession()?.User;
    this.userAccountInfo = RhUserAccountInfo.create();
    this.userAccountInfo.UserName = user?.UserName;
    this.userAccountInfo.Name = user?.DisplayName;
    this.userAccountInfo.OpSign = OpMode.OpEdit;
    this.initPage(this.userAccountInfo);

    this.changePwdControlStatus(false);
  }

  initUpdatePasswordDto(): RhUpdatePasswordDto {
    return RhUpdatePasswordDto.create();
  }

  confirmValidator = (control: UntypedFormControl): { [s: string]: boolean } => {
    if (!control.value) {
      return { error: true, required: true };
    } else if (control.value !== this.updatePasswordForm.controls['NewPassword'].value) {
      return { confirm: true, error: true };
    }
    return {};
  };

  createUpdatePasswordForm(dto: RhUpdatePasswordDto) {
    this.updatePasswordForm = this.fb.group({
      /** 用户密码 */
      Password: [dto.Password, [Validators.required]],
      /** 用户新密码 */
      NewPassword: [dto.NewPassword, [Validators.required]],
      /** 用户新密码 */
      NewPassword2: [null, [this.confirmValidator]]
    });
  }

  submitUpdatePasswordForm($event: Event) {
    if ($event) {
      $event.preventDefault();
    }
    FormHelper.YGSubmitForm(this.updatePasswordDto, this.updatePasswordForm, (dto) => {
      this.updatePassword(dto as RhUpdatePasswordDto);
    });
  }

  resetUpdatePasswordForm($event: Event | null) {
    if ($event) {
      $event.preventDefault();
    }
    this.updatePasswordDto = this.initUpdatePasswordDto();
    this.updatePasswordForm.reset(this.updatePasswordDto);
  }

  checkUserPassword() {
    // 验证密码
    this.updatePasswordDto.Password = this.updatePasswordForm.get('Password')?.value;
    this.operator.CheckUserPassword(this.updatePasswordDto).subscribe((result) => {
      if (result.Success) {
        this.isCorrectPwd = true;
        this.changePwdControlStatus(true);
      } else {
        this.isCorrectPwd = false;
        this.changePwdControlStatus(false);
        // MsgHelper.ShowErrorMessage(`用户名与密码不匹配！${result.Message}`);
      }
    });
  }

  updatePassword(dto: RhUpdatePasswordDto) {
    // 更新密码
    this.updateLoading = true;
    this.operator.UpdatePassword(dto).subscribe(
      (result) => {
        if (result.Success) {
          MsgHelper.ShowSuccessMessage('修改成功！');
          this.closeUpdatePasswordModal();
        } else {
          MsgHelper.ShowWarningMessage(`修改失败！${result.Message}`);
        }
        this.updateLoading = false;
      },
      () => {
        this.updateLoading = false;
      }
    );
  }

  initPage(item: RhUserAccountInfo) {
    this.updatePasswordDto = this.initUpdatePasswordDto();
    this.updatePasswordDto.UserId = item.UserName;
    this.createUpdatePasswordForm(this.updatePasswordDto);
  }

  closeUpdatePasswordModal() {
    this.oldpasswordVisible = this.newpasswordVisible = this.newpasswordVisible2 = false;
    this.isCorrectPwd = null;
    this.resetUpdatePasswordForm(null);
    this.rhClose.emit();
  }

  private changePwdControlStatus(status: boolean) {
    if (status) {
      this.updatePasswordForm.get('NewPassword')?.enable();
      this.updatePasswordForm.get('NewPassword2')?.enable();
    } else {
      this.updatePasswordForm.get('NewPassword')?.disable();
      this.updatePasswordForm.get('NewPassword2')?.disable();
    }
  }
}
