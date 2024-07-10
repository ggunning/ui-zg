import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ZielgruppenService {

  private url: string = 'http://localhost';
  private accounts: any;
  private accountsRequestPromise: Promise<any> | null = null;

  constructor(private http: HttpClient) {
    console.log('ZielgruppenService: Service instantiated');
  }

  getAccounts(): Observable<any> {
    if (this.accounts) {
      console.log('ZielgruppenService: Returning cached accounts data');
      return of(this.accounts);
    }

    if (this.accountsRequestPromise) {
      console.log('ZielgruppenService: Returning ongoing accounts request as Observable');
      return new Observable(observer => {
        this.accountsRequestPromise!.then(response => {
          observer.next(response);
          observer.complete();
        }).catch(err => {
          observer.error(err);
        });
      });
    }

    console.log('ZielgruppenService: Fetching accounts data from server');
    this.accountsRequestPromise = this.http.get<any>(this.url + "/contacts").toPromise().then(response => {
      console.log('ZielgruppenService: Accounts data fetched and cached');
      this.accounts = response;
      this.accountsRequestPromise = null; // Reset the promise after completion
      return this.accounts;
    });

    return new Observable(observer => {
      this.accountsRequestPromise!.then(response => {
        observer.next(response);
        observer.complete();
      }).catch(err => {
        observer.error(err);
      });
    });
  }

  getContacts(): Observable<any> {
    return this.getAccounts(); // Assuming accounts and contacts are the same for simplicity
  }

  getStoredAccounts(): any {
    console.log('ZielgruppenService: getStoredAccounts called');
    return this.accounts;
  }
}
