import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserService } from '../shared/user.service';
import { Router } from "@angular/router";
import { OccupantService } from '../shared/occupant.service';
import { Occupant } from '../shared/occupant.model';

declare var M: any;

@Component({
  selector: 'app-occupant',
  templateUrl: './occupant.component.html',
  styleUrls: ['./occupant.component.css'],
  providers: [OccupantService]
})
export class OccupantComponent implements OnInit {

  constructor(private occupantService: OccupantService, private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.resetForm();
    this.refreshOccupantList();
  }

  resetForm(form?: NgForm) {
    if (form)
      form.reset();
    this.occupantService.selectedOccupant = {
      _id: "",
      name: "",
      phone_number: "",
      house_number: "",
      images: "",
      license_plate: ""
    }
  }

  onSubmit(form: NgForm) {
    if (form.value._id == "") {
      this.occupantService.postOccupant(form.value).subscribe((res) => {
        this.resetForm(form);
        this.refreshOccupantList();
        M.toast({ html: 'Saved successfully', classes: 'rounded' });
      });
    }
    else {
      this.occupantService.putOccupant(form.value).subscribe((res) => {
        this.resetForm(form);
        this.refreshOccupantList();
        M.toast({ html: 'Updated successfully', classes: 'rounded' });
      });
    }
  }

  refreshOccupantList() {
    this.occupantService.getOccupantList().subscribe((res) => {
      this.occupantService.occupants = res as Occupant[];
    });
  }

  onEdit(lg: Occupant) {
    this.occupantService.selectedOccupant = lg;
  }

  onDelete(_id: string, form: NgForm) {
    if (confirm('Are you sure to delete this record ?') == true) {
      this.occupantService.deleteOccupant(_id).subscribe((res) => {
        this.refreshOccupantList();
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
