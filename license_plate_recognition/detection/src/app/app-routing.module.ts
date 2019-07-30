import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogUpdateComponent } from './log-update/log-update.component';

const routes: Routes = [{ path: 'update', component: LogUpdateComponent}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
