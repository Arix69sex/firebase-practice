import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./views/login/login.component";
import {RegisterComponent} from "./views/register/register.component";
import {HomeComponent} from "./views/home/home.component";
import {AuthGuard} from "./guard/auth.guard";
import {LoggedInGuard} from "./guard/logged-in.guard";
import {MyNotesComponent} from "./views/my-notes/my-notes.component";
import {NoteDetailComponent} from "./views/note-detail/note-detail.component";
import {WalletComponent} from "./views/wallet/wallet.component";

const routes: Routes = [
  {path: '', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'login', component: LoginComponent, canActivate: [LoggedInGuard]},
  {path: 'register', component: RegisterComponent, canActivate: [LoggedInGuard]},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'my-notes', component: MyNotesComponent, canActivate: [AuthGuard]},
  {path: 'my-notes/:id', component: NoteDetailComponent, canActivate: [AuthGuard]},
  {path: 'wallet', component: WalletComponent, canActivate: [AuthGuard]}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
