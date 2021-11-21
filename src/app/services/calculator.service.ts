import { Injectable } from '@angular/core';
import {NoteService} from "./note.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Form, FormGroup} from "@angular/forms";
import {Expense} from "../model/expense";

@Injectable({
  providedIn: 'root'
})
export class CalculatorService {
  rateType!: String;

  constructor(private noteService: NoteService,
              private firestore: AngularFirestore) {
    this.rateType = this.noteService.getRateType()
  }

  getDiasTranscurridos(fechaDescuento: string, fechaVencimiento: string): number{
    let dateDesc = new Date(fechaDescuento)
    if (this.rateType == "Tasa Nominal") {
      dateDesc = new Date(fechaDescuento)
    }
    let dateVenc = new Date(fechaVencimiento)
    return ( dateVenc.getTime() - dateDesc.getTime() ) / (1000 * 3600 * 24)
  }

  getTasaPeriodo(dias: number, plazoTasa: string, periodoTasa: string, tasa: number): number {
    let n = 0
    let m = 0
    let plazo = this.noteService.getPlazoValue(plazoTasa)
    let periodo = this.noteService.getPlazoValue(periodoTasa)

    if (this.rateType == "Tasa Efectiva") {
      return Number(((Math.pow((1 + tasa/100),(dias / plazo)) - 1)*100))
    }else {
      m = plazo/periodo
      n = dias/periodo
      return Number(((Math.pow(1 + (tasa/(100*m)), n) - 1)*100))
    }
  }

  getTasaDescontada(TEP: number) {
    TEP = TEP/100
    return Number(((TEP/(1 + TEP))*100).toFixed(7))
  }

  getDescuento(valorNominal: number, TEP: number) {
    TEP = TEP/100
    return Number((valorNominal * this.getTasaDescontada(TEP)))
  }

  getTotalCostosIni(costosIniciales: Array<Expense>, valorNominal: number ){
    let iniTotal = 0
    for (let i = 0; i < costosIniciales.length; i++){
      if (costosIniciales[i].valueType == "Efectivo"){
        iniTotal += Number(costosIniciales[i].amount)
      }
      else {
        iniTotal += Number(costosIniciales[i].amount)/100 * valorNominal
      }
    }
    return Number(iniTotal)
  }

  getTotalCostosFin(costosFinales: Array<Expense>, valorNominal: number ){
    let finTotal = 0
    for (let i = 0; i < costosFinales.length; i++){
      if (costosFinales[i].valueType == "Efectivo"){
        finTotal += Number(costosFinales[i].amount)
      }
      else {
        finTotal += Number(costosFinales[i].amount)/100 * valorNominal
      }
    }
    return Number(finTotal)
  }

  getValorNeto(valorNominal: number, TEP: number) {
    return Number((valorNominal - this.getDescuento(valorNominal, TEP)).toFixed(2))
  }

  getValorRecibido(valorNominal: number, costosIniciales: Array<Expense>, TEP: number ,retencion: number) {
    return Number((this.getValorNeto(valorNominal, TEP) - this.getTotalCostosIni(costosIniciales, valorNominal) - retencion).toFixed(2))
  }

  getValorEntregado(valorNominal: number, costosFinales: Array<Expense>, TEP: number, retencion: number, remuneracion: number) {
    return Number((valorNominal + this.getTotalCostosFin(costosFinales, valorNominal) - retencion - remuneracion).toFixed(2))
  }

  getTCEP(entregado: number, recibido: number, diasTCEP:number, dias: number ) {
    return Number(((Math.pow((entregado/recibido), diasTCEP/dias) - 1)* 100))
  }
}
