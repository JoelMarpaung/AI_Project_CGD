import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../shared/user.service';
import { Router } from "@angular/router";
import { LogService } from '../shared/log.service';
import { Log } from '../shared/log.model';

declare var M: any;

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.css'],
  providers: [LogService]
})
export class LogComponent implements OnInit {

  constructor(private logService: LogService, private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.resetForm();
    this.refreshLogList();
  }

  resetForm(form?: NgForm) {
    if (form)
      form.reset();
    this.logService.selectedLog = {
      _id: "",
      id_occupant: "",
      name: "",
      license_plate: "",
      status: "",
      date: "",
    }
  }

  onSubmit(form: NgForm) {
    if (form.value._id == "") {
      this.logService.postLog(form.value).subscribe((res) => {
        this.resetForm(form);
        this.refreshLogList();
        M.toast({ html: 'Saved successfully', classes: 'rounded' });
      });
    }
    else {
      this.logService.putLog(form.value).subscribe((res) => {
        this.resetForm(form);
        this.refreshLogList();
        M.toast({ html: 'Updated successfully', classes: 'rounded' });
      });
    }
  }

  refreshLogList() {
    this.logService.getLogList().subscribe((res) => {
      this.logService.logs = res as Log[];
    });
  }

  onEdit(lg: Log) {
    this.logService.selectedLog = lg;
  }

  onDelete(_id: string, form: NgForm) {
    if (confirm('Are you sure to delete this record ?') == true) {
      this.logService.deleteLog(_id).subscribe((res) => {
        this.refreshLogList();
        this.resetForm(form);
        M.toast({ html: 'Deleted successfully', classes: 'rounded' });
      });
    }
  }

  onLogout(){
    this.userService.deleteToken();
    this.router.navigate(['/login']);
  }

}
