import {AfterContentInit, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {AuthServiceService} from "../../services/auth-service.service";
import {forkJoin, Observable, range} from "rxjs";
import {User} from "../../model/user";
import {NoteService} from "../../services/note.service";
import {Form, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Expense} from "../../model/expense";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {DatePipe} from "@angular/common";
import {CalculatorService} from "../../services/calculator.service";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterContentInit, OnChanges {

  @Input() currentView: number = 1;
  @Input() rateType: String = this.noteService.getRateType()
  @Input() currencyType: String = this.noteService.getCurrencyType()

  rateTypeChange: Observable<String> = new Observable<String>()
  currencyTypeChange: Observable<String> = new Observable<String>()
  initialExpenses: Array<Expense> = [];
  finalExpenses: Array<Expense> = [];
  diasTrans!: number;
  tea!: number;
  tep!: number;
  d!: number;
  descuento!: number;
  retencion!: number;
  totalIni!: number;
  valorNeto!: number;
  valorRecibido!:number;
  totalFin!: number;
  valorEntregado!: number;
  tcea!: number;

  firstForm: FormGroup = this.formBuilder.group({
    fechaGiro: ['', [Validators.required]],
    fechaVencimiento: ['', [Validators.required]],
    valorNominal: ['', [Validators.required]],
    retencion: ['', [Validators.required,]],
  });

  effectiveForm: FormGroup = this.formBuilder.group({
    nDias: ['', [Validators.required]],
    plazoTasa: ['', [Validators.required]],
    tasaEfectiva: ['', [Validators.required]],
    fechaDescuento: ['', [Validators.required,]],
  });

  nominalForm: FormGroup = this.formBuilder.group({
    nDias: ['', [Validators.required]],
    plazoTasa: ['', [Validators.required]],
    tasaNominal: ['', [Validators.required]],
    periodoCapital: ['', [Validators.required,]],
    fechaDescuento: ['', [Validators.required,]],
  });

  initialExpensesForm: FormGroup = this.formBuilder.group({
    motive: ['', [Validators.required]],
    amount: ['', [Validators.required]],
    valueType: ['', [Validators.required]]
  });
  finalExpensesForm: FormGroup = this.formBuilder.group({
    motive: ['', [Validators.required]],
    amount: ['', [Validators.required]],
    valueType: ['', [Validators.required]]
  });

  constructor(private authService: AuthServiceService,
              private noteService: NoteService,
              private formBuilder: FormBuilder,
              private firestore: AngularFirestore,
              private calculatorService: CalculatorService) {
    this.rateTypeChange.subscribe(() => {
      this.rateType = this.noteService.getRateType()
    })
    this.currencyTypeChange.subscribe(() => {
      this.currencyType = this.noteService.getCurrencyType()
    })
  }

  ngAfterContentInit(): void {
  }

  ngOnInit(): void {
    this.rateType = this.noteService.getRateType()
    this.currencyType = this.noteService.getCurrencyType()
    console.log(this.rateType)
    console.log(this.currencyType)
    this.currentView = 1;
    console.log(this.currentView)
    this.setView()
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.setView()
  }

  changeViewValue(n: number){
    console.log(this.firstForm)
    if(this.rateType == "Tasa Efectiva"){
      console.log(this.effectiveForm)
    }else console.log(this.nominalForm)

    if (this.currentView + n < 7 || this.currentView + n < 1){
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
    let letraId = "";

    if (this.firstForm.invalid && (this.effectiveForm.invalid || this.nominalForm.invalid)){
      alert("Alguno de los formularios es inválido. \nNo te olvides de llenar todos los campos.")
    }
    else {
      let dateDesc = ""
      if (this.rateType == "Tasa Efectiva"){
        dateDesc = this.effectiveForm.getRawValue().fechaDescuento
      }
      else dateDesc = this.nominalForm.getRawValue().fechaDescuento

      if (!this.calculatorService.datesValid(this.firstForm.getRawValue().fechaGiro, dateDesc, this.firstForm.getRawValue().fechaVencimiento)){
        alert("Rango de fechas es invalido. Recuerda: \nFecha de Giro < Fecha de Descuento < Fecha Vencimiento")
      }
      else {
        // Guardar letras en db
        this.firestore.collection("letras").add({
            fechaGiro: this.firstForm.getRawValue().fechaGiro,
            fechaVencimiento: this.firstForm.getRawValue().fechaVencimiento,
            valorNominal: this.firstForm.getRawValue().valorNominal,
            retencion: this.firstForm.getRawValue().retencion,
            uid: JSON.parse(<string>localStorage.getItem('user')).uid
          }
        ).then(r => {
          console.log(r.id)
          letraId = r.id
          // Guardar tasa en db
          if (this.rateType == "Tasa Efectiva") {
            this.firestore.collection("tasas").add({
                fecha_descuento: this.effectiveForm.getRawValue().fechaDescuento,
                fecha_vencimiento: this.effectiveForm.getRawValue().fechaDescuento,
                n_dias: this.effectiveForm.getRawValue().nDias,
                plazo_tasa: this.effectiveForm.getRawValue().plazoTasa,
                tasa_efectiva: this.effectiveForm.getRawValue().tasaEfectiva,
                tipo: this.rateType,
                letra_id: letraId
              }
            ).then(() => {
              this.saveExpenses(letraId)
              this.loadResults()
              this.changeViewValue(1)})
          }
          else {
            this.firestore.collection("tasas").add({
                fecha_descuento: this.nominalForm.getRawValue().fechaDescuento,
                fecha_vencimiento: this.nominalForm.getRawValue().fechaDescuento,
                n_dias: this.nominalForm.getRawValue().nDias,
                plazo_tasa: this.nominalForm.getRawValue().plazoTasa,
                periodo_capital: this.nominalForm.getRawValue().periodoCapital,
                tasa_nominal: this.nominalForm.getRawValue().tasaNominal,
                tipo: this.rateType,
                letra_id: letraId
              }
            ).then(() => {
              this.saveExpenses(letraId)
              this.loadResults()
              this.changeViewValue(1)
            })
          }

        });
      }

    }

  }

  async saveExpenses(letraId: string) {
    // Guardar costos iniciales en db
    for (let i = 0; i < this.initialExpenses.length; i++) {
      this.firestore.collection("costos-iniciales").add({
          monto: this.initialExpenses[i].amount,
          motivo: this.initialExpenses[i].motive,
          tipo: this.initialExpenses[i].valueType,
          letra_id: letraId
        }
      ).then(() => null)
    }
    // Guardar costos finales en db
    for (let i = 0; i < this.finalExpenses.length; i++) {
      this.firestore.collection("costos-finales").add({
          monto: this.finalExpenses[i].amount,
          motivo: this.finalExpenses[i].motive,
          tipo: this.finalExpenses[i].valueType,
          letra_id: letraId
        }
      ).then(() => null)
    }
  }

  loadResults() {
    let diasAño = 0
    if (this.rateType == "Tasa Efectiva"){
      diasAño = Number(this.effectiveForm.getRawValue().nDias)
      this.diasTrans = this.calculatorService.getDiasTranscurridos(this.effectiveForm.getRawValue().fechaDescuento, this.firstForm.getRawValue().fechaVencimiento)
      this.tea = this.calculatorService.getTasaPeriodo(diasAño, this.effectiveForm.getRawValue().plazoTasa, this.effectiveForm.getRawValue().periodoCapital, this.effectiveForm.getRawValue().tasaEfectiva)
      this.tep = this.calculatorService.getTasaPeriodo(this.diasTrans, this.effectiveForm.getRawValue().plazoTasa, this.effectiveForm.getRawValue().periodoCapital,this.effectiveForm.getRawValue().tasaEfectiva)
    } else {
      diasAño = Number(this.nominalForm.getRawValue().nDias)
      this.diasTrans = this.calculatorService.getDiasTranscurridos(this.nominalForm.getRawValue().fechaDescuento, this.firstForm.getRawValue().fechaVencimiento)
      this.tea = this.calculatorService.getTasaPeriodo(diasAño, this.nominalForm.getRawValue().plazoTasa, this.nominalForm.getRawValue().periodoCapital, this.nominalForm.getRawValue().tasaNominal)
      this.tep = this.calculatorService.getTasaPeriodo(this.diasTrans, this.nominalForm.getRawValue().plazoTasa, this.nominalForm.getRawValue().periodoCapital,this.nominalForm.getRawValue().tasaNominal)
    }
    this.d = this.calculatorService.getTasaDescontada(this.tep)
    this.descuento = this.calculatorService.getDescuento(this.firstForm.getRawValue().valorNominal, this.d)
    this.retencion = Number((this.firstForm.getRawValue().retencion).toFixed(2))
    this.totalIni = this.calculatorService.getTotalCostosIni(this.initialExpenses, this.firstForm.getRawValue().valorNominal)
    this.valorNeto = this.calculatorService.getValorNeto(this.firstForm.getRawValue().valorNominal, this.d)
    this.valorRecibido = this.calculatorService.getValorRecibido(this.firstForm.getRawValue().valorNominal, this.initialExpenses, this.d, this.retencion)
    this.totalFin = this.calculatorService.getTotalCostosFin(this.finalExpenses, this.firstForm.getRawValue().valorNominal)
    this.valorEntregado = this.calculatorService.getValorEntregado(this.firstForm.getRawValue().valorNominal, this.finalExpenses, this.d, this.retencion, 0)
    this.tcea = this.calculatorService.getTCEP(this.valorEntregado, this.valorRecibido, diasAño, this.diasTrans)

  }

  addInitialExpenses() {
    console.log(this.initialExpensesForm)
    if (this.initialExpensesForm.invalid){
      console.log("Invalid expense form")
    }
    else {
      let newExpense:  Expense = new Expense();
      newExpense.amount = this.initialExpensesForm.value.amount
      newExpense.valueType = this.initialExpensesForm.value.valueType
      newExpense.motive = this.initialExpensesForm.value.motive
      newExpense.uid = JSON.parse(<string>localStorage.getItem('user')).uid;
      this.initialExpenses.push(newExpense)
    }

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

  clearInitialExpenses() {
    this.initialExpenses = []
  }

  clearFinalExpenses() {
    this.finalExpenses = []
  }

  deleteInitialExpense(id: number) {
    this.initialExpenses.splice(id, 1);
  }

  deleteFinalExpense(id: number) {
    this.finalExpenses.splice(id, 1);
  }

  setView() {
    let firstView = document.getElementById("first-view")
    let secondView = document.getElementById("second-view")
    let thirdView = document.getElementById("third-view")
    let fourthView = document.getElementById("fourth-view")
    let resultsView = document.getElementById("results-view")
    // @ts-ignore
    firstView.style.display = "none"
    // @ts-ignore
    secondView.style.display = "none"
    // @ts-ignore
    thirdView.style.display = "none"
    // @ts-ignore
    fourthView.style.display = "none"
    // @ts-ignore
    resultsView.style.display = "none"

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
          if (this.currentView == 4) {
            console.log("Enabling fourth view...")
            // @ts-ignore
            fourthView.style.display = "block"
          } else {
            console.log("Enabling results view...")
            // @ts-ignore
            resultsView.style.display = "block"
          }
        }
      }
    }
  }
}
