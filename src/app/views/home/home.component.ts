import {AfterContentInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AuthServiceService} from "../../services/auth-service.service";
import {forkJoin, Observable} from "rxjs";
import {User} from "../../model/user";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterContentInit, OnChanges {

  @Input() currentView: number = 1;

  constructor(private authService: AuthServiceService) { }

  ngAfterContentInit(): void {
  }

  ngOnInit(): void {
    this.currentView = 1;
    console.log(this.currentView)
    this.setView()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setView()
  }

  changeViewValue(n: number){
    if (this.currentView + n < 6 || this.currentView + n < 1){
      this.currentView += n;
    }
  }

  setView() {
    let firstView = document.getElementById("first-view")
    let secondView = document.getElementById("second-view")
    let thirdView = document.getElementById("third-view")
    let fourthView = document.getElementById("fourth-view")

    // @ts-ignore
    firstView.style.visibility = "hidden"
    // @ts-ignore
    secondView.style.visibility = "hidden"
    // @ts-ignore
    thirdView.style.visibility = "hidden"
    // @ts-ignore
    fourthView.style.visibility = "hidden"

    if (this.currentView == 1) {
      console.log("Enabling first view...")
      // @ts-ignore
      firstView.style.visibility = "visible"
    }else{
      if (this.currentView == 2) {
        // @ts-ignore
        secondView.style.visibility = "visible"
      }else{
        if (this.currentView == 3) {
          // @ts-ignore
          thirdView.style.visibility = "visible"
        }else{
            // @ts-ignore
            fourthView.style.visibility = "visible"
        }
      }
    }
  }
}
