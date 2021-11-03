import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthServiceService} from "../../services/auth-service.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = this.formBuilder.group({
    email: ['', [Validators.email, Validators.required, Validators.minLength(6)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });


  constructor(private authService: AuthServiceService,
              private formBuilder: FormBuilder,
              private router: Router) { }

  ngOnInit(): void {
  }

  confirmLogin(): void {
    if (this.loginForm.invalid) {
      return;
    }
    else {
      this.authService.SignIn(this.loginForm.getRawValue().email, this.loginForm.getRawValue().password).then(r => location.reload());
    }
  }
}
