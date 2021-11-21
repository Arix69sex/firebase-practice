import {Component, Input, OnInit, SimpleChanges} from '@angular/core';
import {Observable} from "rxjs";
import {Expense} from "../../model/expense";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthServiceService} from "../../services/auth-service.service";
import {NoteService} from "../../services/note.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {CalculatorService} from "../../services/calculator.service";
import {Note} from "../../model/note";
import * as constants from "constants";
import {assertNotNull} from "@angular/compiler/src/output/output_ast";

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.css']
})
export class WalletComponent implements OnInit {

  data: Array<any> = []
  totalValorRecibido: number = 0
  totalTCEA: number = 0

  @Input() currentView: number = 1;
  @Input() rateType: String = this.noteService.getRateType()
  @Input() currencyType: String = this.noteService.getCurrencyType()
  rateTypeChange: Observable<String> = new Observable<String>()
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
  }

  ngAfterContentInit(): void {
  }

  ngOnInit(): void {
    this.testing()
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
    let tempLetra = new Note()
    let tempArray: Note[] = []
    if (this.checkNoteFormInvalid() && this.checkBaseFormsInvalid()){
      alert("Alguno de los formularios es inválido. \nNo te olvides de llenar todos los campos.")
    }
    else {
      let dateDesc = ""
      if (this.rateType == "Tasa Efectiva"){
        dateDesc = this.effectiveForm.getRawValue().fechaDescuento
      }
      else dateDesc = this.nominalForm.getRawValue().fechaDescuento
      tempLetra.id = JSON.parse(<string>localStorage.getItem('user')).uid
      tempLetra.fechaGiro = this.firstForm.getRawValue().fechaGiro
      tempLetra.fechaVencimiento = this.firstForm.getRawValue().fechaVencimiento
      tempLetra.valorNominal = this.firstForm.getRawValue().valorNominal
      tempLetra.retencion = this.firstForm.getRawValue().retencion
      if (!this.calculatorService.datesValid(tempLetra.fechaGiro, dateDesc, tempLetra.fechaVencimiento)){
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
          tempLetra.id = r.id
          // Guardar tasa en db
          if (this.rateType == "Tasa Efectiva") {
            this.noteService.setPlazoAnualValue(Number(this.effectiveForm.getRawValue().nDias))
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
              tempArray.push(tempLetra)
              console.log(tempArray)
              this.data.push(tempArray)
              console.log(this.data)
              this.saveExpenses(letraId)
              this.loadResults()
            })
          }
          else {
            this.noteService.setPlazoAnualValue(Number(this.nominalForm.getRawValue().nDias))
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
              tempArray.push(tempLetra)
              console.log(tempArray)
              this.data.push(tempArray)
              console.log(this.data)
              this.saveExpenses(letraId)
              this.loadResults()
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

  checkBaseFormsInvalid() {
    return (this.effectiveForm.invalid && this.nominalForm.invalid)
  }

  checkNoteFormInvalid() {
    return this.firstForm.invalid
  }

  loadResults() {
    if (this.rateType == "Tasa Efectiva"){
      this.diasTrans = this.calculatorService.getDiasTranscurridos(this.effectiveForm.getRawValue().fechaDescuento, this.firstForm.getRawValue().fechaVencimiento)
      this.tea = this.calculatorService.getTasaPeriodo(this.noteService.getPlazoValue("Anual"), this.effectiveForm.getRawValue().plazoTasa, this.effectiveForm.getRawValue().periodoCapital, this.effectiveForm.getRawValue().tasaEfectiva)
      this.tep = this.calculatorService.getTasaPeriodo(this.diasTrans, this.effectiveForm.getRawValue().plazoTasa, this.effectiveForm.getRawValue().periodoCapital,this.effectiveForm.getRawValue().tasaEfectiva)
    } else {
      this.diasTrans = this.calculatorService.getDiasTranscurridos(this.nominalForm.getRawValue().fechaDescuento, this.firstForm.getRawValue().fechaVencimiento)
      this.tea = this.calculatorService.getTasaPeriodo(this.noteService.getPlazoValue("Anual"), this.nominalForm.getRawValue().plazoTasa, this.nominalForm.getRawValue().periodoCapital, this.nominalForm.getRawValue().tasaNominal)
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
    this.tcea = this.calculatorService.getTCEP(this.valorEntregado, this.valorRecibido, this.noteService.getPlazoValue("Anual"), this.diasTrans)
    this.data[this.data.length-1].push(this.diasTrans)
    this.data[this.data.length-1].push(this.tep)
    this.data[this.data.length-1].push(this.d)
    this.data[this.data.length-1].push(this.descuento)
    this.data[this.data.length-1].push(this.totalIni)
    this.data[this.data.length-1].push(this.totalFin)
    this.data[this.data.length-1].push(this.valorNeto)
    this.data[this.data.length-1].push(this.valorRecibido)
    this.data[this.data.length-1].push(this.valorEntregado)
    this.data[this.data.length-1].push(this.tcea)
    this.loadResultadosCartera()
    this.enableNotesView()
  }

  xirr(transactions: any) {
    const { xirr } = require('node-irr')
    const { convertRate } = require('node-irr')
    let data = []
    for (let i = 0; i < transactions.length; i++){
      data.push({
        amount: transactions[i][0],
        date: transactions[i][1]})
    }
    console.log(data)
    let rate = xirr(data).rate
    return convertRate(rate, this.noteService.getPlazoValue("Anual"))*100
  }

  testing(){
    console.log(this.formatDate("11-27-2021"))
    const { xirr } = require('node-irr')
    const { convertRate } = require('node-irr')
    let data = [
      // currently accepted formats for strings:
      // YYYYMMDD, YYYY-MM-DD, YYYY/MM/DD
      { amount: 139839.35, date: '20211113' },
      { amount: -70000, date: '20211127' },
      { amount: -70000, date: '20211127' },
    ]
    for (let i = 0; i < 6; i++){
      data.push({
        amount: data[i].amount,
        date: data[i].date})
    }
    let rate = xirr(data).rate
    console.log(data)
    return convertRate(rate, this.noteService.getPlazoValue("Anual"))
  }

  formatDate(date: string) {
    let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('');
  }

  loadResultadosCartera() {
    let transactions = []
    this.totalTCEA = 0
    this.totalValorRecibido = 0
    let totalValorEntregado = 0
    for (let i = 0; i < this.data.length; i++){
      console.log(this.data[i][8])
      this.totalValorRecibido += this.data[i][8]
      totalValorEntregado += this.data[i][9]
    }

    if (this.rateType == "Tasa Efectiva"){
      transactions.push( [this.totalValorRecibido, this.formatDate(this.effectiveForm.getRawValue().fechaDescuento)] )
    }else transactions.push([this.totalValorRecibido, this.formatDate(this.nominalForm.getRawValue().fechaDescuento) ])

    for (let i = 0; i < this.data.length; i++){
      transactions.push([-this.data[i][9], this.formatDate(this.data[i][0].fechaVencimiento)])
    }
    console.log(transactions)

    this.totalTCEA = this.xirr(transactions)

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

  deleteElement(id: number) {
    this.noteService.deleteNote(this.data[id][0])
    this.data.splice(id, 1);
    this.loadResultadosCartera()
  }

  enableNotesView() {
    let firstView = document.getElementById("first-view")
    let resultsView = document.getElementById("results-view")
    let notesView = document.getElementById("notes-view")
    // @ts-ignore
    firstView.style.paddingTop = "8rem"
    // @ts-ignore
    notesView.style.display = "block"
    // @ts-ignore
    resultsView.style.display = "block"
  }

  setView() {
    let firstView = document.getElementById("first-view")
    let secondView = document.getElementById("second-view")
    let thirdView = document.getElementById("third-view")
    let fourthView = document.getElementById("fourth-view")
    let resultsView = document.getElementById("results-view")
    let notesView = document.getElementById("notes-view")
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
    // @ts-ignore
    notesView.style.display = "none"
    if (this.currentView == 1) {
      console.log("Enabling first view...")
      this.setRateView()
      // @ts-ignore
      secondView.style.display = "block"
    }else{
      if (this.currentView == 2) {
        console.log("Enabling second view...")
        // @ts-ignore
        thirdView.style.display = "block"
      }else{
        if (this.currentView == 3) {
          console.log("Enabling third view...")
          // @ts-ignore
          fourthView.style.display = "block"
        }else{
          if (this.currentView == 4) {
            if (this.checkBaseFormsInvalid()) {
              alert("Alguno de los formularios es inválido. \nNo te olvides de llenar todos los campos.")
              this.changeViewValue(-1)
            } else {
              console.log("Enabling fourth view...")
              // @ts-ignore
              firstView.style.display = "block"
            }

          }
        }
      }
    }
  }


}
