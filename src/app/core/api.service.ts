import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employee } from '../models/employee';

@Injectable({ providedIn: 'root' })
export class ApiService {
	private readonly baseUrl = 'http://localhost:3001';

	constructor(private http: HttpClient) {}

	getEmployees(): Observable<Employee[]> {
        return this.http.get<Employee[]>(`${this.baseUrl}/employees`);
	}

	postAttendance(payload: any): Observable<any> {
		return this.http.post<any>(`${this.baseUrl}/attendance`, payload);
	}
}
