import {AfterContentInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AuthServiceService} from "../../services/auth-service.service";
import {forkJoin, Observable} from "rxjs";
import {User} from "../../model/user";
import {NoteService} from "../../services/note.service";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Expense} from "../../model/expense";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterContentInit, OnChanges {

  @Input() currentView: number = 1;
  @Input() rateType: String = this.noteService.getRateType()
  rateTypeChange: Observable<String> = new Observable<String>()
  initialExpenses: Array<Expense> = [];
  finalExpenses: Array<Expense> = [];

  firstForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.email, Validators.required, Validators.minLength(6)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  initialExpensesForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.email, Validators.required, Validators.minLength(6)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });
  finalExpensesForm: FormGroup = this.formBuilder.group({
    motive: ['', [Validators.required]],
    amount: ['', [Validators.required]],
    valueType: ['', [Validators.required]]
  });

  constructor(private authService: AuthServiceService,
              private noteService: NoteService,
              private formBuilder: FormBuilder) {
    this.rateTypeChange.subscribe(() => {
      this.rateType = this.noteService.getRateType()
    })
  }

  ngAfterContentInit(): void {
  }

  ngOnInit(): void {
    this.rateType = this.noteService.getRateType()
    console.log(this.rateType)
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
    this.setView()
  }

  setRateView() {
    console.log(this.rateType)
    let effectiveView = document.getElementById("effective-rate-type")
    let nominalView = document.getElementById("nominal-rate-type")

    // @ts-ignore
    effectiveView.style.display = "none"
    // @ts-ignore
    nominalView.style.display = "none"

    if (this.rateType == "Tasa Efectiva") {
      console.log("Enabling effective-type view...")
      // @ts-ignore
      effectiveView.style.display = "block"
    }else {
        console.log("Enabling nominal-type view...")
        // @ts-ignore
        nominalView.style.display = "block"
    }
  }

  submitValues(){
  }

  addFinalExpense() {
    console.log(this.finalExpensesForm)
    if (this.finalExpensesForm.invalid){
      console.log("Invalid expense form")
    }
    else {
      let newExpense:  Expense = new Expense();
      newExpense.amount = this.finalExpensesForm.value.amount
      newExpense.valueType = this.finalExpensesForm.value.valueType
      newExpense.motive = this.finalExpensesForm.value.motive
      newExpense.uid = JSON.parse(<string>localStorage.getItem('user')).uid;
      this.finalExpenses.push(newExpense)
    }

  }

  deleteFinalExpense(id: number) {
    this.finalExpenses.splice(id, 1);
  }

  setView() {
    let firstView = document.getElementById("first-view")
    let secondView = document.getElementById("second-view")
    let thirdView = document.getElementById("third-view")
    let fourthView = document.getElementById("fourth-view")

    // @ts-ignore
    firstView.style.display = "none"
    // @ts-ignore
    secondView.style.display = "none"
    // @ts-ignore
    thirdView.style.display = "none"
    // @ts-ignore
    fourthView.style.display = "none"

    if (this.currentView == 1) {
      console.log("Enabling first view...")
      // @ts-ignore
      firstView.style.display = "block"
    }else{
      if (this.currentView == 2) {
        console.log("Enabling second view...")
        this.setRateView()
        // @ts-ignore
        secondView.style.display = "block"
      }else{
        if (this.currentView == 3) {
          console.log("Enabling third view...")
          // @ts-ignore
          thirdView.style.display = "block"
        }else{
            console.log("Enabling fourth view...")
            // @ts-ignore
            fourthView.style.display = "block"
        }
      }
    }
  }
}
