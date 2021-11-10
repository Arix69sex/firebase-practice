import {AfterContentInit, AfterViewInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {Router} from "@angular/router";
import {AuthServiceService} from "./services/auth-service.service";
import {Observable} from "rxjs";
import {NoteService} from "./services/note.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit , AfterViewInit{
  title = 'firebase-practice';

  constructor(private router: Router,
              private authService: AuthServiceService,
              private noteService: NoteService) {
  }

  ngOnInit(): void {
    let type = JSON.parse(<string>localStorage.getItem('rate-type'));
    console.log(type)
    let options = document.getElementById("rate-options");
    if (type == "Tasa Efectiva"){
      // @ts-ignore
      options.value = "0"
    } else {
      // @ts-ignore
      options.value = "1"
    }
    this.setNavbars()
  }

  ngAfterViewInit(): void {
    this.setNavbars();
  }

  setEmailButton() {
    let emailStringButton = document.getElementById("emailStringButton");
    let user = JSON.parse(<any>localStorage.getItem('user'));
    // @ts-ignore
    emailStringButton.innerText = user.email;
  }

  setRate() {
    let select = document.getElementById("rate-options")
    // @ts-ignore
    let value = select.options[select.selectedIndex].value;
    console.log(value)
    if (value == "0") {
      console.log("Setting to effective rate")
      this.noteService.setToEffective()
    } else {
      console.log("Setting to nominal rate")
      this.noteService.setToNominal()
    }
    location.reload()
  }

  setNavbars() {
    let notLoggedInNavbar = document.getElementById("notLoggedInNavbar");
    let loggedInNavbar = document.getElementById("loggedInNavbar");

    // If user is logged in
    if (JSON.parse(<any>localStorage.getItem('user')) != null){
      this.setEmailButton()
      // @ts-ignore
      notLoggedInNavbar.style.visibility = "hidden";
      // @ts-ignore
      loggedInNavbar.style.visibility = "block";
    }
    // If user is not logged in
    else {
      // @ts-ignore
      notLoggedInNavbar.style.visibility = "block";
      // @ts-ignore
      loggedInNavbar.style.visibility = "hidden";
    }
  }

  isUserLoggedIn() {
    console.log(this.authService.checkUserData())
    return this.authService.checkUserData() != undefined;
  }

  logout() {
    this.authService.SignOut();
    this.noteService.clear();
    this.setNavbars();
    this.router.navigate(['/login/']).then(() => location.reload());
  }

  navigateToLogin() {
    this.router.navigate(['/login/']).then(() => null);
  }

  navigateToJoin() {
    this.router.navigate(['/register/']).then(() => null);
  }

  navigateToHome(){
    this.router.navigate(['/home/']).then(() => null);
  }

  navigateToHistory(){
    this.router.navigate(['/history/']).then(() => null);
  }
}
