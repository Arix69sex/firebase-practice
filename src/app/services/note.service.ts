import { Injectable } from '@angular/core';
import {Observable, Subject} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class NoteService {

  rateType!: String;

  constructor() {
    console.log(JSON.parse(<string>localStorage.getItem('rate-type')));
  }

  getRateType(): String {
    if (JSON.parse(<string>localStorage.getItem('rate-type')) == null) this.setToEffective()
    return JSON.parse(<string>localStorage.getItem('rate-type'));
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
}
