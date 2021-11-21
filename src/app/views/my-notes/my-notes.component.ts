import {AfterContentInit, AfterViewInit, Component, OnInit} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Note} from "../../model/note";
import {Expense} from "../../model/expense";
import {Router} from "@angular/router";
import {NoteService} from "../../services/note.service";

@Component({
  selector: 'app-my-notes',
  templateUrl: './my-notes.component.html',
  styleUrls: ['./my-notes.component.css']
})
export class MyNotesComponent implements OnInit{
  letras: Array<Note> = []

  constructor(private firestore: AngularFirestore,
              private noteService: NoteService,
              private router: Router) {
    this.noteService.loadNotesFromDb()
    this.letras = this.noteService.getNotes()
  }

  ngOnInit(): void {
    console.log(this.letras)
  }

  deleteInitialExpense(i: number) {
    console.log(this.letras[i])
    this.noteService.deleteNote(this.letras[i])
    this.letras.splice(i, 1)
  }

  navigateToDetails(i: number) {
    this.router.navigate([`/my-notes/${i}`]).then(() => null);
  }
}
