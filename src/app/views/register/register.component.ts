import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthServiceService} from "../../services/auth-service.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  joinForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.email, Validators.required, Validators.minLength(6)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor(private authService: AuthServiceService,
              private formBuilder: FormBuilder,
              private router: Router) { }

  ngOnInit(): void {
    this.joinForm.valueChanges.subscribe();
  }

  confirmJoin(): void {
    if (this.joinForm.invalid) {
      return;
    }
    else {
      this.authService.SignUp(this.joinForm.getRawValue().email, this.joinForm.getRawValue().password).then(r => location.reload());
    }
  }
}
