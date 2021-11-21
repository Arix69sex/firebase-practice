import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";
import {Note} from "../model/note";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Expense} from "../model/expense";
import {Rate} from "../model/rate";

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  dictPlazo: {[index: string]:any} = {
    'Anual': 360,
    'Semestral': 180,
    'Cuatrimestral': 120,
    'Trimestral': 90,
    'Bimestral': 60,
    'Mensual': 30,
    'Quincenal': 15,
    'Diario': 1
  }

  rateType!: String;
  currencyType!: String;
  letras: Array<Note> = []
  costos_iniciales: Array<Expense> = []
  costos_finales: Array<Expense> = []

  constructor(private firestore: AngularFirestore) {
  }

  getNotes(): Array<Note> {
    this.loadNotesFromDb()
    return this.letras
  }

  setPlazoAnualValue(value: number){
    this.dictPlazo["Anual"] = value
  }

  getPlazoValue(key: string): number {
    return this.dictPlazo[key]
  }

  deleteNote(note: Note) {
    console.log("Deleting Note")
    this.firestore.collection('letras').doc(note.id).delete().then(r => this.loadNotesFromDb());
  }

  loadNotesFromDb() {
    this.letras = []
    let uid = JSON.parse(<string>localStorage.getItem('user')).uid
    let query = this.firestore.collection('letras', ref => ref.where('uid', '==', uid))
    query.get().subscribe((querySnapshot) => {
      querySnapshot.docs.forEach(doc => {
        let letra = new Note();
        // @ts-ignore
        letra.id = doc.id
        // @ts-ignore
        letra.uid = doc.data().uid
        // @ts-ignore
        letra.fechaGiro = doc.data().fechaGiro
        // @ts-ignore
        letra.fechaVencimiento = doc.data().fechaVencimiento
        // @ts-ignore
        letra.valorNominal = doc.data().valorNominal
        // @ts-ignore
        letra.retencion = doc.data().retencion
        this.letras.push(letra)
      })
    })
  }

  getInitialExpenses(letra_id: string) {
    return this.costos_iniciales
  }

  getFinalExpenses(letra_id: string) {
    return this.costos_finales
  }

  loadExpensesByNoteIdFromDb(letra_id: string) {
    this.costos_iniciales = []
    this.costos_finales = []
    let queryInicial = this.firestore.collection('costos-iniciales', ref => ref.where('letra_id', '==', letra_id))
    queryInicial.get().subscribe((querySnapshot) => {
      querySnapshot.docs.forEach(doc => {
        let expense = new Expense();
        // @ts-ignore
        expense.id = doc.data().id
        // @ts-ignore
        expense.letra_id = doc.data().letra_id
        // @ts-ignore
        expense.amount = doc.data().monto
        // @ts-ignore
        expense.motive = doc.data().motivo
        // @ts-ignore
        expense.valueType = doc.data().tipo
        this.costos_iniciales.push(expense)
      })
    })
    let queryFinal = this.firestore.collection('costos-finales', ref => ref.where('letra_id', '==', letra_id))
    queryFinal.get().subscribe((querySnapshot) => {
      querySnapshot.docs.forEach(doc => {
        let expense = new Expense();
        // @ts-ignore
        expense.id = doc.data().id
        // @ts-ignore
        expense.letra_id = doc.data().letra_id
        // @ts-ignore
        expense.amount = doc.data().monto
        // @ts-ignore
        expense.motive = doc.data().motivo
        // @ts-ignore
        expense.valueType = doc.data().tipo
        this.costos_iniciales.push(expense)
      })
    })
  }

  getRateByNoteId(letra_id: string): Rate {
    let query = this.firestore.collection('tasas', ref => ref.where('letra_id', '==', letra_id))
    let rate = new Rate();
    query.get().subscribe((querySnapshot) => {
      querySnapshot.docs.forEach(doc => {
        // @ts-ignore
        rate.letra_id = letra_id
        // @ts-ignore
        rate.fechaDescuento = doc.data().fecha_descuento
        // @ts-ignore
        rate.nDias = doc.data().n_dias
        // @ts-ignore
        rate.plazoTasa = doc.data().plazo_tasa
        // @ts-ignore
        rate.tasaEfectiva = doc.data().tasa_efectiva
        // @ts-ignore
        rate.tasaNominal = doc.data().tasa_nominal
        // @ts-ignore
        rate.tipo = doc.data().tipo
        // @ts-ignore
        rate.id = doc.data().id
      })
    })

    return rate;
  }

  loadExpensesByNoteId(letra_id: string) {
    let query = this.firestore.collection('costos-iniciales', ref => ref.where('letra_id', '==', letra_id))

    query.get().subscribe((querySnapshot) => {
      querySnapshot.docs.forEach(doc => {
        let expense = new Expense();
        // @ts-ignore
        expense.letra_id = letra_id
        // @ts-ignore
        expense.motive = doc.data().motivo
        // @ts-ignore
        expense.motive = doc.data().motivo
        // @ts-ignore
        expense.motive = doc.data().motivo
        // @ts-ignore
        expense.motive = doc.data().motivo
        this.costos_iniciales.push(expense)
      })
    })
  }

  getRateType(): String {
    if (JSON.parse(<string>localStorage.getItem('rate-type')) == null) this.setToEffective()
    return JSON.parse(<string>localStorage.getItem('rate-type'));
  }

  getCurrencyType(): String {
    if (JSON.parse(<string>localStorage.getItem('currency-type')) == undefined) this.setToSoles()
    console.log(JSON.parse(<string>localStorage.getItem('currency-type')))
    return JSON.parse(<string>localStorage.getItem('currency-type'));
  }

  setToDollars() {
    this.currencyType = "Dollars"
    localStorage.setItem('currency-type', JSON.stringify(this.currencyType));
    JSON.parse(<string>localStorage.getItem('currency-type'));
  }

  setToSoles() {
    this.currencyType = "Soles"
    localStorage.setItem('currency-type', JSON.stringify(this.currencyType));
    JSON.parse(<string>localStorage.getItem('currency-type'));
  }

  setToEffective() {
    this.rateType = "Tasa Efectiva";
    localStorage.setItem('rate-type', JSON.stringify(this.rateType));
    JSON.parse(<string>localStorage.getItem('rate-type'));
  }

  setToNominal() {
    this.rateType = "Tasa Nominal";
    localStorage.setItem('rate-type', JSON.stringify(this.rateType));
    JSON.parse(<string>localStorage.getItem('rate-type'));
  }

  clear() {
    localStorage.removeItem('rate-type');
  }
}
