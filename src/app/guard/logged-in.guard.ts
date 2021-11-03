import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import { Observable } from 'rxjs';
import {AuthServiceService} from "../services/auth-service.service";

@Injectable({
  providedIn: 'root'
})
export class LoggedInGuard implements CanActivate {

  constructor(private authService: AuthServiceService,
              private router: Router) {
  }

  canActivate(): boolean {
    if (JSON.parse(<any>localStorage.getItem('user')) != null) {
      this.router.navigate(['/home/']).then(() => null);
      return false
    }
    else {
      return true
    }
  }

}
