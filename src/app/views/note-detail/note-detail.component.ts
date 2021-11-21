import { Component, OnInit } from '@angular/core';
import {NoteService} from "../../services/note.service";
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {ActivatedRoute, Router} from "@angular/router";
import {Note} from "../../model/note";
import {Rate} from "../../model/rate";

@Component({
  selector: 'app-note-detail',
  templateUrl: './note-detail.component.html',
  styleUrls: ['./note-detail.component.css']
})
export class NoteDetailComponent implements OnInit {
  noteId!: number;
  note!: Note;
  letras: Array<Note> = []
  rate!: Rate;

  constructor(private noteService: NoteService,
              private firestore: AngularFirestore,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.loadNotes().then(() => this.loadData().then(() => this.setRateView()))
  }

  async loadNotes() {
    this.noteService.loadNotesFromDb()
  }

  async loadData() {
    this.route.params.subscribe(params => {
      if (params.id) {
        this.letras = this.noteService.getNotes()
        this.noteId = params.id
        this.note = this.letras[this.noteId]
        this.rate = this.noteService.getRateByNoteId(this.note.id)
        this.setRateView()
      }
    })
  }

  setRateView() {
    let effectiveView = document.getElementById("effective-rate-type")
    let nominalView = document.getElementById("nominal-rate-type")
    console.log(this.rate.tipo)
    // @ts-ignore
    effectiveView.style.display = "none"
    // @ts-ignore
    nominalView.style.display = "none"

    if (this.rate.tipo == "Tasa Efectiva") {
      console.log("Enabling effective-type view...")
      // @ts-ignore
      effectiveView.style.display = "block"
    }else {
      console.log("Enabling nominal-type view...")
      // @ts-ignore
      nominalView.style.display = "block"
    }
  }

}
